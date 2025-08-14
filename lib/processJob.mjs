import Tesseract from 'tesseract.js';
import OpenAI from 'openai';
import db from './db.mjs';
import fs from 'fs';
import path from 'path';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

// Enhanced logging function
function log(message, level = 'INFO', jobId = null) {
  const timestamp = new Date().toISOString();
  const prefix = jobId ? `[Job ${jobId}]` : '[Worker]';
  console.log(`${timestamp} ${prefix} [${level}] ${message}`);
}

// Load environment variables
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || 'ap-northeast-1';
const BUCKET = process.env.AWS_S3_BUCKET || 'ai-receipt-apex';

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS credentials are not properly configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
}

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

function isS3Url(url) {
  return url.startsWith('https://ai-receipt-apex.s3.ap-northeast-1.amazonaws.com/');
}

async function downloadS3ToTemp(s3Url, jobId) {
  try {
    const url = new URL(s3Url);
    const key = url.pathname.slice(1); // supports prefixes
    const tempDir = os.tmpdir(); // Use system temp directory
    const tempPath = path.join(tempDir, uuidv4() + '-' + key.replace(/\//g, '_'));
    log(`[Job ${jobId}] [INFO] Downloading from S3 key: ${key} to ${tempPath}`);
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const data = await s3.send(command);
    const writeStream = fs.createWriteStream(tempPath);
    await new Promise((resolve, reject) => {
      data.Body.pipe(writeStream);
      data.Body.on('error', reject);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    log(`[Job ${jobId}] [INFO] S3 download complete: ${tempPath}`);
    log(`[Job ${jobId}] [DEBUG] File exists after download: ${fs.existsSync(tempPath)}`);
    try {
      const stat = fs.statSync(tempPath);
      log(`[Job ${jobId}] [DEBUG] File size: ${stat.size} bytes, mode: ${stat.mode.toString(8)}`);
    } catch (e) {
      log(`[Job ${jobId}] [ERROR] Could not stat file: ${e.message}`);
    }
    return tempPath;
  } catch (err) {
    log(`[Job ${jobId}] [ERROR] S3 download error: ${err.message}`, 'ERROR', jobId);
    throw err;
  }
}

export async function processPendingJobs() {
  try {
    // Get one pending job
    const job = db.prepare('SELECT * FROM jobs WHERE status = ? ORDER BY created_at LIMIT 1').get('pending');
    if (!job) {
      log('No pending jobs found', 'DEBUG');
      return;
    }

    log(`Starting to process job ${job.id} for uploader: ${job.uploader_name}`, 'INFO', job.id);
    log(`File path: ${job.file_path}`, 'DEBUG', job.id);

    let localFilePath = job.file_path;
    let tempDownloaded = false;
    if (isS3Url(job.file_path)) {
      try {
        localFilePath = await downloadS3ToTemp(job.file_path, job.id);
        tempDownloaded = true;
      } catch (err) {
        const error = `Failed to download from S3: ${err.message}`;
        log(error, 'ERROR', job.id);
        db.updateJob(job.id, { status: 'failed', error, progress: 100 });
        return;
      }
    }

    // Check if file exists
    if (!fs.existsSync(localFilePath)) {
      const error = `File not found after S3 download: ${localFilePath}`;
      log(error, 'ERROR', job.id);
      db.updateJob(job.id, { status: 'failed', error, progress: 100 });
      if (tempDownloaded) fs.unlinkSync(localFilePath);
      return;
    }

    // Check file size
    const stats = fs.statSync(localFilePath);
    log(`File size: ${stats.size} bytes`, 'DEBUG', job.id);

    db.updateJob(job.id, { status: 'processing', progress: 0 });

    try {
      // OCR recognition (Japanese)
      log('Starting OCR processing...', 'INFO', job.id);
      db.updateJob(job.id, { progress: 10 });
      
      const ocrResult = await Tesseract.recognize(
        localFilePath,
        'jpn',
        { 
          logger: m => {
            log(`OCR Progress: ${m.status} - ${m.progress || 'N/A'}`, 'DEBUG', job.id);
          }
        }
      );
      
      const ocrText = ocrResult.data.text;
      log(`OCR completed. Text length: ${ocrText.length} characters`, 'INFO', job.id);
      log(`OCR Text preview: ${ocrText.substring(0, 200)}...`, 'DEBUG', job.id);
      
      if (!ocrText || ocrText.trim().length === 0) {
        const error = 'OCR returned empty text';
        log(error, 'ERROR', job.id);
        db.updateJob(job.id, { status: 'failed', error, progress: 100 });
        if (tempDownloaded) fs.unlinkSync(localFilePath);
        return;
      }

      db.updateJob(job.id, { progress: 40 });

      // Use OpenAI to extract fields
      log('Starting OpenAI processing...', 'INFO', job.id);
      
      if (!process.env.OPENAI_API_KEY) {
        const error = 'OpenAI API key not configured';
        log(error, 'ERROR', job.id);
        db.updateJob(job.id, { status: 'failed', error, progress: 100 });
        if (tempDownloaded) fs.unlinkSync(localFilePath);
        return;
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const prompt = `
        Prefer japanese language over english, only use english if it is indicated, do not try to translate to english.
        Analyze this receipt and respond with ONLY a JSON object in this exact format:
        {
          "uploader_name": "${job.uploader_name}",
          "receipt_type": "decide whether it is a 'grocery' or 'internet telephone payment' or 'parking' or whatever is the best category you can decide dont forget in japanese langauge also",
          "date": "date of purchase",
          "company_name": "the company name on the receipt",
          "price": "the full amount paid in Japanese yen, no unit",
          "image_name": "A short, human-friendly, descriptive filename for this receipt, using company, date, and type, in English or Japanese, no spaces, use dashes or underscores, keep extension as .jpg",
          "items": [
            { "name": "item name", "qty": "quantity", "unit_price": "unit price", "total": "total for this item" },
            ...
          ]
        }
        OCRテキスト:
        ${ocrText}
      `;
      
      log('Sending request to OpenAI...', 'DEBUG', job.id);
      const gptRes = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      });
      
      db.updateJob(job.id, { progress: 70 });
      const jsonText = gptRes.choices[0].message.content;
      log(`OpenAI response received. Length: ${jsonText.length} characters`, 'INFO', job.id);
      log(`OpenAI response: ${jsonText}`, 'DEBUG', job.id);
      
      let receiptJson;
      try {
        receiptJson = JSON.parse(jsonText);
        log('JSON parsing successful', 'INFO', job.id);
        log(`Parsed data: ${JSON.stringify(receiptJson)}`, 'DEBUG', job.id);
      } catch (parseError) {
        const error = `GPT parsing failed: ${parseError.message}. Response: ${jsonText}`;
        log(error, 'ERROR', job.id);
        db.updateJob(job.id, { status: 'failed', error, result: jsonText, progress: 100 });
        if (tempDownloaded) fs.unlinkSync(localFilePath);
        return;
      }

      // Validate required fields
      const requiredFields = ['uploader_name', 'receipt_type', 'date', 'company_name', 'price', 'image_name', 'items'];
      const missingFields = requiredFields.filter(field => !receiptJson[field]);
      if (missingFields.length > 0) {
        const error = `Missing required fields: ${missingFields.join(', ')}`;
        log(error, 'ERROR', job.id);
        db.updateJob(job.id, { status: 'failed', error, result: JSON.stringify(receiptJson), progress: 100 });
        if (tempDownloaded) fs.unlinkSync(localFilePath);
        return;
      }

      // Save to receipts table
      log('Saving to database...', 'INFO', job.id);
      try {
        db.prepare(
          'INSERT INTO receipts (uploader_name, receipt_type, date, company_name, price, raw_ocr, file_path, image_name, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(
          receiptJson.uploader_name,
          receiptJson.receipt_type,
          receiptJson.date,
          receiptJson.company_name,
          receiptJson.price,
          ocrText,
          job.file_path,
          receiptJson.image_name,
          JSON.stringify(receiptJson.items)
        );
        log('Database save successful', 'INFO', job.id);
      } catch (dbError) {
        const error = `Database save failed: ${dbError.message}`;
        log(error, 'ERROR', job.id);
        db.updateJob(job.id, { status: 'failed', error, result: JSON.stringify(receiptJson), progress: 100 });
        if (tempDownloaded) fs.unlinkSync(localFilePath);
        return;
      }

      db.updateJob(job.id, { status: 'done', progress: 100, result: JSON.stringify(receiptJson) });
      log(`Job ${job.id} completed successfully`, 'INFO', job.id);
      
    } catch (err) {
      const error = `Processing failed: ${err.message}`;
      const stackTrace = err.stack || 'No stack trace available';
      log(error, 'ERROR', job.id);
      log(`Stack trace: ${stackTrace}`, 'ERROR', job.id);
      db.updateJob(job.id, { status: 'failed', error: `${error}\nStack: ${stackTrace}`, progress: 100 });
    }
    if (tempDownloaded) fs.unlinkSync(localFilePath);
  } catch (workerError) {
    log(`Worker error: ${workerError.message}`, 'ERROR');
    log(`Worker stack trace: ${workerError.stack}`, 'ERROR');
  }
}