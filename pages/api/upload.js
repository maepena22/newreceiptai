import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';
import OpenAI from 'openai';
import db from '../../lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload failed' });

    // Get uploader_name from fields
    const uploader_name = fields.uploader_name || '';

    // Support multiple files
    let uploadedFiles = files.file;
    if (!uploadedFiles) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!Array.isArray(uploadedFiles)) {
      uploadedFiles = [uploadedFiles];
    }

    const results = [];
    for (const uploadedFile of uploadedFiles) {
      if (!uploadedFile || !uploadedFile.filepath) continue;

      // OCR recognition (Japanese)
      const ocrResult = await Tesseract.recognize(
        uploadedFile.filepath,
        'jpn',
        { logger: m => console.log(m) }
      );
      const ocrText = ocrResult.data.text;

      // Use OpenAI to extract fields
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const prompt = `
        Prefer japanese language over english, only use english if it is indicated, do not try to translate to english.
        Analyze this receipt and respond with ONLY a JSON object in this exact format:
        {
          "uploader_name": "${uploader_name}",
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
      const jsonText = gptRes.choices[0].message.content;
      let receiptJson;
      try {
        receiptJson = JSON.parse(jsonText);
      } catch {
        return res.status(500).json({ error: 'GPT parsing failed', raw: jsonText });
      }

      // Save to SQLite database
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

      results.push({ ...receiptJson, raw_ocr: ocrText });
    }

    res.json(results);
  });
}