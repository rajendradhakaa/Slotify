# Email Troubleshooting Guide

## Issue: Mail is Not Sending

### Error Message
```
Username and Password not accepted. For more information, go to
https://support.google.com/mail/?p=BadCredentials
```

### Solution: Regenerate Gmail App Password

**Step 1: Ensure 2-Factor Authentication is Enabled**
1. Go to https://accounts.google.com/
2. Click "Security" in the left sidebar
3. Scroll down to "How you sign in to Google"
4. Ensure "2-Step Verification" is **ON**
   - If OFF, click it and follow the setup steps

**Step 2: Generate a New App Password**
1. Go to https://accounts.google.com/
2. Click "Security" → "App passwords"
   - You may need to sign in again
3. Select:
   - App: **Mail**
   - Device: **Windows PC** (or your device type)
4. Click "Generate"
5. Copy the **16-character password** shown
6. Update the password in your `.env` file:
   ```
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx
   ```
   (Remove spaces if any)

**Step 3: Update `.env` File**

File: `backend/.env`
```env
SMTP_USER=rajdhaka4927@gmail.com
SMTP_PASSWORD=<YOUR_NEW_16_CHAR_PASSWORD>
```

**Step 4: Restart Backend**
```bash
# Kill existing process
kill 51740

# Or restart uvicorn manually if using manual startup
```

The auto-reload development server should restart automatically.

**Step 5: Test Email**
```bash
curl -X POST http://localhost:8000/api/bookings/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","name":"Test User"}'
```

Expected response:
```json
{
  "status": "success",
  "message": "Test email sent successfully"
}
```

---

## For Production (.env.production)

If deploying to production, also update:
```env
SMTP_USER=rajdhaka4927@gmail.com
SMTP_PASSWORD=<YOUR_NEW_16_CHAR_PASSWORD>
```

Then redeploy on your server (Render, VPS, etc).

---

## Why This Happens

- Gmail app passwords expire or become invalid
- 2-FA needs to be enabled to use app passwords
- The `?` character in the email was causing parsing errors (now fixed)

## Verification

Once fixed, test emails will send when:
- ✅ A booking is created on the public booking page
- ✅ Confirmation emails are sent to invitee
- ✅ Host receives booking notification

