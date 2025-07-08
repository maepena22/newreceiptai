# Debugging Job Failures

This guide explains how to use the enhanced logging system to troubleshoot why jobs are failing in your Japanese Receipt OCR application.

## Quick Start

1. **Check the console output** where you run `npm run dev` - all logs are printed there
2. **Visit the Jobs page** (`/jobs`) to see job status and error previews
3. **Click on any job ID** to see detailed error information in a modal
4. **Set LOG_LEVEL=DEBUG** for maximum verbosity: `LOG_LEVEL=DEBUG npm run dev`

## Log Format

All logs follow this format:
```
2024-01-15T10:30:00.000Z [Job 123] [INFO] Starting to process job 123 for uploader: test_user
```

- **Timestamp**: When the event occurred
- **Context**: `[Job 123]` for job-specific logs, `[Worker]` for worker process logs
- **Level**: `DEBUG`, `INFO`, `WARN`, or `ERROR`
- **Message**: What happened

## Common Failure Scenarios

### 1. File Upload Issues

**Symptoms**: Jobs stuck in "pending" status, no processing logs

**Look for these logs**:
```
[Upload API] Starting file upload processing
[Upload API] Form parsed successfully
[Upload API] Processing 2 file(s)
[Upload API] Created job batch: 456
[Upload API] Processing file: receipt1.png
[Upload API] File copy failed: ENOENT: no such file or directory
```

**Solutions**:
- Check if the `temp` directory exists and has write permissions
- Verify uploaded files are valid image files
- Check disk space

### 2. File Not Found Errors

**Symptoms**: Jobs fail immediately with "File not found" error

**Look for these logs**:
```
[Job 123] [INFO] Starting to process job 123 for uploader: test_user
[Job 123] [DEBUG] File path: temp/receipt1.png
[Job 123] [ERROR] File not found: temp/receipt1.png
```

**Solutions**:
- Check if files were properly copied to the temp directory
- Verify file paths in the database
- Check if files were accidentally deleted

### 3. OCR Failures

**Symptoms**: Jobs fail during OCR processing

**Look for these logs**:
```
[Job 123] [INFO] Starting OCR processing...
[Job 123] [DEBUG] OCR Progress: loading tesseract core
[Job 123] [DEBUG] OCR Progress: initializing tesseract
[Job 123] [INFO] OCR completed. Text length: 0 characters
[Job 123] [ERROR] OCR returned empty text
```

**Solutions**:
- Verify the image quality (clear, readable text)
- Check if the image format is supported (PNG, JPG, etc.)
- Ensure the Japanese language data file (`jpn.traineddata`) is present
- Try with a different image to isolate the issue

### 4. OpenAI API Issues

**Symptoms**: Jobs fail during AI processing

**Look for these logs**:
```
[Job 123] [INFO] Starting OpenAI processing...
[Job 123] [ERROR] OpenAI API key not configured
```

**Or**:
```
[Job 123] [INFO] Sending request to OpenAI...
[Job 123] [ERROR] Processing failed: Request failed with status code 401
```

**Solutions**:
- Set the `OPENAI_API_KEY` environment variable
- Verify the API key is valid and has sufficient credits
- Check OpenAI API status and rate limits

### 5. JSON Parsing Errors

**Symptoms**: Jobs fail after OpenAI processing

**Look for these logs**:
```
[Job 123] [INFO] OpenAI response received. Length: 45 characters
[Job 123] [DEBUG] OpenAI response: Sorry, I cannot process this receipt.
[Job 123] [ERROR] GPT parsing failed: Unexpected token S in JSON at position 0
```

**Solutions**:
- The AI model returned non-JSON text instead of the expected format
- Check the OCR text quality - poor OCR can confuse the AI
- Review the prompt to ensure it's clear about JSON format requirements

### 6. Missing Required Fields

**Symptoms**: Jobs fail during validation

**Look for these logs**:
```
[Job 123] [INFO] JSON parsing successful
[Job 123] [DEBUG] Parsed data: {"uploader_name":"test_user","receipt_type":"grocery"}
[Job 123] [ERROR] Missing required fields: date, company_name, price
```

**Solutions**:
- The AI model didn't extract all required fields
- Check if the receipt image contains the missing information
- Review the prompt to ensure all required fields are clearly specified

### 7. Database Errors

**Symptoms**: Jobs fail during save operation

**Look for these logs**:
```
[Job 123] [INFO] Saving to database...
[Job 123] [ERROR] Database save failed: UNIQUE constraint failed: receipts.id
```

**Solutions**:
- Check database permissions and disk space
- Verify database schema is correct
- Check for database connection issues

### 8. Worker Process Crashes

**Symptoms**: No jobs are being processed, worker process stopped

**Look for these logs**:
```
[Worker] [INFO] Worker started
[Worker] [ERROR] Worker loop error: Cannot read property 'data' of undefined
[Worker] [ERROR] Stack trace: TypeError: Cannot read property 'data' of undefined
```

**Solutions**:
- Check for unhandled exceptions in the worker
- Verify all dependencies are properly installed
- Check system resources (memory, CPU)

## Using the Jobs Page for Debugging

### Error Column
The Jobs page now shows error previews in the Error column:
- Hover over truncated errors to see the full message
- Click on job IDs to see detailed information

### Job Details Modal
Click any job ID to open a detailed modal showing:
- Basic job information (uploader, status, progress)
- File path and timestamps
- Full error messages with stack traces
- Results (if successful)

### Batch Progress
- Monitor overall batch progress
- Identify which jobs in a batch are failing
- Check if failures are isolated or systematic

## Environment Variables for Debugging

```bash
# Show all logs including debug information
LOG_LEVEL=DEBUG npm run dev

# Show only warnings and errors
LOG_LEVEL=WARN npm run dev

# Show only error logs
LOG_LEVEL=ERROR npm run dev
```

## Advanced Debugging

### 1. Enable Debug Logging
```bash
LOG_LEVEL=DEBUG npm run dev
```

### 2. Check Database Directly
```bash
sqlite3 invoices.db
.tables
SELECT * FROM jobs WHERE status = 'failed' ORDER BY created_at DESC LIMIT 5;
```

### 3. Monitor File System
```bash
# Check temp directory
ls -la temp/

# Monitor file creation
watch -n 1 'ls -la temp/'
```

### 4. Check Process Logs
```bash
# View worker process logs
ps aux | grep worker

# Check for memory issues
top -p $(pgrep -f worker)
```

## Troubleshooting Checklist

When a job fails, check these in order:

1. **Console Logs**: Look for error messages in the terminal
2. **Job Details**: Click the job ID in the Jobs page
3. **File System**: Verify the uploaded file exists
4. **API Keys**: Check if OpenAI API key is set
5. **Network**: Verify internet connection for API calls
6. **Database**: Check database connectivity and permissions
7. **Resources**: Monitor system memory and disk space
8. **Dependencies**: Ensure all packages are installed correctly

## Getting Help

If you're still having issues:

1. **Collect Logs**: Run with `LOG_LEVEL=DEBUG` and collect all console output
2. **Screenshot**: Take a screenshot of the Jobs page showing the failed job
3. **Job Details**: Copy the error details from the job modal
4. **Environment**: Note your Node.js version and operating system
5. **Steps to Reproduce**: Document the exact steps that led to the failure

This enhanced logging system should help you quickly identify and resolve most job processing issues. 