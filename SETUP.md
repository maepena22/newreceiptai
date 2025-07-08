# Setup Guide

## OpenAI API Configuration

Your jobs are failing because the OpenAI API key is not configured. Here's how to fix it:

### 1. Get an OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the generated API key

### 2. Configure the API Key
Create a `.env.local` file in your project root with:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_actual_api_key_here

# Optional: Set log level for debugging
LOG_LEVEL=INFO
```

### 3. Restart the Application
After adding the API key, restart your development server:

```bash
npm run dev
```

## What the Logs Show

The enhanced logging system is working perfectly! Here's what you can see:

### Successful OCR Processing
```
[1] 2025-07-08T05:10:45.758Z [Job 133] [INFO] OCR completed. Text length: 518 characters
[1] 2025-07-08T05:10:45.758Z [Job 133] [DEBUG] OCR Text preview: 」 ENEO 〇 OS...
```

### Clear Error Identification
```
[1] 2025-07-08T05:10:45.759Z [Job 133] [ERROR] OpenAI API key not configured
```

### Detailed Progress Tracking
- File validation and size checks
- OCR progress with percentage updates
- Step-by-step processing logs
- Clear error messages with context

## Other Potential Issues

If you still see failures after adding the API key, the logs will help identify:

1. **File Issues**: Missing files, corrupted images
2. **OCR Issues**: Poor image quality, unsupported formats
3. **OpenAI Issues**: Rate limits, API errors, invalid responses
4. **Database Issues**: Connection problems, schema errors

## Monitoring Jobs

1. **Real-time logs**: Watch the console output during processing
2. **Jobs page**: Visit `/jobs` to see job status and error details
3. **Job details**: Click on any job ID to see detailed error information
4. **Batch grouping**: Jobs are grouped by upload batch for easier management

The logging system will help you quickly identify and fix any issues that arise! 