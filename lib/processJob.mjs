import Tesseract from 'tesseract.js';
import OpenAI from 'openai';
import db from './db.mjs';
import fs from 'fs';

// Enhanced logging function
function log(message, level = 'INFO', jobId = null) {
  const timestamp = new Date().toISOString();
  const prefix = jobId ? `[Job ${jobId}]` : '[Worker]';
  console.log(`${timestamp} ${prefix} [${level}] ${message}`);
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

    // Check if file exists
    if (!fs.existsSync(job.file_path)) {
      const error = `File not found: ${job.file_path}`;
      log(error, 'ERROR', job.id);
      db.updateJob(job.id, { status: 'failed', error, progress: 100 });
      return;
    }

    // Check file size
    const stats = fs.statSync(job.file_path);
    log(`File size: ${stats.size} bytes`, 'DEBUG', job.id);

    db.updateJob(job.id, { status: 'processing', progress: 0 });

    try {
      // OCR recognition (Japanese)
      log('Starting OCR processing...', 'INFO', job.id);
      db.updateJob(job.id, { progress: 10 });
      
      const ocrResult = await Tesseract.recognize(
        job.file_path,
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
        return;
      }

      db.updateJob(job.id, { progress: 40 });

      // Use OpenAI to extract fields
      log('Starting OpenAI processing...', 'INFO', job.id);
      
      if (!process.env.OPENAI_API_KEY) {
        const error = 'OpenAI API key not configured';
        log(error, 'ERROR', job.id);
        db.updateJob(job.id, { status: 'failed', error, progress: 100 });
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
        return;
      }

      // Validate required fields
      const requiredFields = ['uploader_name', 'receipt_type', 'date', 'company_name', 'price'];
      const missingFields = requiredFields.filter(field => !receiptJson[field]);
      if (missingFields.length > 0) {
        const error = `Missing required fields: ${missingFields.join(', ')}`;
        log(error, 'ERROR', job.id);
        db.updateJob(job.id, { status: 'failed', error, result: JSON.stringify(receiptJson), progress: 100 });
        return;
      }

      // Save to receipts table
      log('Saving to database...', 'INFO', job.id);
      try {
        db.prepare(
          'INSERT INTO receipts (uploader_name, receipt_type, date, company_name, price, raw_ocr) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(
          receiptJson.uploader_name,
          receiptJson.receipt_type,
          receiptJson.date,
          receiptJson.company_name,
          receiptJson.price,
          ocrText
        );
        log('Database save successful', 'INFO', job.id);
      } catch (dbError) {
        const error = `Database save failed: ${dbError.message}`;
        log(error, 'ERROR', job.id);
        db.updateJob(job.id, { status: 'failed', error, result: JSON.stringify(receiptJson), progress: 100 });
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
  } catch (workerError) {
    log(`Worker error: ${workerError.message}`, 'ERROR');
    log(`Worker stack trace: ${workerError.stack}`, 'ERROR');
  }
} 