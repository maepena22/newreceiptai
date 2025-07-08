import Tesseract from 'tesseract.js';
import OpenAI from 'openai';
import db from './db.mjs';

export async function processPendingJobs() {
  // Get one pending job
  const job = db.prepare('SELECT * FROM jobs WHERE status = ? ORDER BY created_at LIMIT 1').get('pending');
  if (!job) return;

  db.updateJob(job.id, { status: 'processing', progress: 0 });

  try {
    // OCR recognition (Japanese)
    db.updateJob(job.id, { progress: 10 });
    const ocrResult = await Tesseract.recognize(
      job.file_path,
      'jpn',
      { logger: m => {/* Optionally log progress */} }
    );
    const ocrText = ocrResult.data.text;
    db.updateJob(job.id, { progress: 40 });

    // Use OpenAI to extract fields
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
    const gptRes = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });
    db.updateJob(job.id, { progress: 70 });
    const jsonText = gptRes.choices[0].message.content;
    let receiptJson;
    try {
      receiptJson = JSON.parse(jsonText);
    } catch {
      db.updateJob(job.id, { status: 'failed', error: 'GPT parsing failed', result: jsonText, progress: 100 });
      return;
    }

    // Save to receipts table
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

    db.updateJob(job.id, { status: 'done', progress: 100, result: JSON.stringify(receiptJson) });
  } catch (err) {
    db.updateJob(job.id, { status: 'failed', error: err.message, progress: 100 });
  }
} 