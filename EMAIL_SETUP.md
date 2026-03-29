# Email Setup Guide - Slotify

This guide walks you through setting up email functionality in Slotify.

## ⚠️ Important: Gmail App Password (NOT Regular Password)

Gmail no longer allows regular passwords for third-party apps. You MUST use an **App Password**.

---

## 🔧 Setup Steps

### Step 1: Enable 2-Step Verification (Required)

1. Go to: https://myaccount.google.com/security
2. Select **2-Step Verification**
3. Follow the prompts to enable it

### Step 2: Generate Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. You'll see a dropdown for "Select the app and device you're using"
   - **App**: Select "Mail"
   - **Device**: Select "Windows Computer" (or your OS)
3. Click **Generate**
4. A 16-character password will appear in a popup
5. **Copy this password** (it only shows once)

### Step 3: Update Environment File

Edit [backend/.env](backend/.env) and replace:

```env
# Email Configuration (Gmail - use App Password)
SMTP_USER=rajdhaka4927@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # <- Your 16-char app password (remove spaces)
```

**Important**: Remove the spaces from the app password!

Example:
```env
SMTP_USER=rajdhaka4927@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
```

### Step 4: Test Email Configuration

After updating `.env`, test if emails work:

1. Restart your backend:
   ```bash
   cd backend
   source venv/bin/activate  # macOS/Linux
   uvicorn app.main:app --reload
   ```

2. Go to the API docs: http://localhost:8000/docs

3. Find the **POST /api/bookings/test-email** endpoint

4. Click **Try it out**

5. Change the test email to your actual email (bottom field shows `"test@gmail.com"`)

6. Click **Execute**

7. Check your email inbox for the test email

**Expected Response** (if successful):
```json
{
  "status": "success",
  "message": "Test email sent successfully to your-email@gmail.com",
  "from": "rajdhaka4927@gmail.com"
}
```

**Error Response** (if credentials are wrong):
```json
{
  "status": "error",
  "message": "Failed to send test email: Invalid credentials",
  "error_type": "AuthenticationError"
}
```

---

## 📧 Email Features

### Booking Confirmation Emails

When a booking is created through the API, **two emails are sent automatically**:

1. **Invitee Email** - Confirmation to the person booking the meeting
   - Subject: `Confirmed: [Event Name] with Rajendra Dhaka`
   - Contains: Event details, date/time, reschedule link

2. **Host Email** - Notification to you (rajendra@example.com)
   - Subject: `New Event Scheduled: [Invitee Name] - [Event Name]`
   - Contains: Invitee details, event info, meeting time

### Email Sending Flow

```
User Books Meeting
        ↓
✅ Booking Created in Database
        ↓
🔄 Background Task Started
        ↓
📧 Test Credentials
        ↓
✉️ Send Email via Gmail SMTP
        ↓
✅ Emails Delivered
```

Emails are sent in the background, so the API responds immediately while emails are sent asynchronously.

---

## 🐛 Troubleshooting

### "Invalid credentials" / "Invalid login" Error

**Solution**: 
- Verify you're using the **16-character App Password**, NOT your Gmail password
- Remove any spaces from the password
- Make sure 2-Step Verification is enabled
- Generate a new App Password and try again

### "SMTP credentials not configured"

**Solution**:
- Check that `SMTP_USER` and `SMTP_PASSWORD` are set in `.env`
- Make sure they're not commented out (remove `#` if present)
- Restart the backend after updating `.env`

### "Authentication failed" or "535 5.7.8 Username and password not accepted"

**Solution**:
- You're using regular Gmail password instead of App Password
- Generate a new App Password: https://myaccount.google.com/apppasswords
- Delete any old App Passwords you created
- Use the new App Password in `.env`

### Test Email Endpoint Returns Error

1. Go to http://localhost:8000/docs
2. Open the **POST /api/bookings/test-email** endpoint
3. Click **Execute** to see the exact error
4. The error message will tell you what's wrong

### Emails Not Being Sent When Booking

1. Check backend console logs for any errors
2. Run the test email endpoint first to verify credentials
3. Make sure `SMTP_USER` and `SMTP_PASSWORD` are configured
4. Check the invitee email address is correct (valid email format)

### Gmail is Blocking Access

If you see "Please log in via your browser" error:
1. Go to: https://accounts.google.com/DisplayUnlockCaptcha
2. Click **Allow** to enable access
3. Try sending the test email again

---

## 🚀 Production Deployment

### Using Gmail in Production

For production, create a separate Gmail account (e.g., `noreply@slotify.com`):

1. Set up 2-Factor Authentication
2. Generate an App Password
3. Update `.env.production`:

```env
# Email Configuration (Gmail)
SMTP_USER=noreply@slotify.com
SMTP_PASSWORD=your-app-password
```

### Using SendGrid or Mailgun (Alternative)

For better deliverability at scale, consider SendGrid or Mailgun:

1. Create an account at https://sendgrid.com
2. Get your SMTP credentials
3. Update backend to use their SMTP server:

```python
# Change in routers/bookings.py:
with smtplib.SMTP_SSL("smtp.sendgrid.net", 465) as server:  # Use SendGrid SMTP
    server.login("apikey", API_KEY)  # Use API key as password
```

---

## ✅ Verification Checklist

- [ ] 2-Step Verification is enabled on Gmail
- [ ] App Password generated at https://myaccount.google.com/apppasswords
- [ ] `.env` file updated with email and password
- [ ] Backend restarted after updating `.env`
- [ ] Test email endpoint sends successfully
- [ ] Test email received in your inbox
- [ ] Create a test booking and receive confirmation email

---

## 📚 Related Documentation

- [Environment Variable Setup](#)
- [Deployment Guide](#)
- [Bookings API Documentation](#)

---

## 🆘 Still Having Issues?

1. Check the exact error message in the API response
2. Verify all environment variables are set correctly
3. Make sure Gmail 2-Step Verification is enabled
4. Try generating a new App Password
5. Check Gmail's security settings: https://myaccount.google.com/security

