# Slotify - Deployment Guide

This guide covers deploying Slotify as separate services: **Frontend on Vercel** and **Backend on a separate server**.

## Table of Contents
1. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
2. [Backend Deployment](#backend-deployment)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)

---

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account (https://vercel.com)
- Git repository (GitHub/GitLab/Bitbucket)
- Node.js 18+ installed locally

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/slotify-frontend.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select "Vite" as framework preset
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. **Add Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add for **Production**:
     ```
     VITE_API_BASE_URL=https://api.slotify.com
     VITE_APP_NAME=Slotify
     ```
   - Add for **Preview/Development**:
     ```
     VITE_API_BASE_URL=https://api-staging.slotify.com
     VITE_APP_NAME=Slotify (Dev)
     ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your site
   - Your site is live at `https://<project-name>.vercel.app`

5. **Connect Custom Domain** (Optional)
   - In Vercel Settings → Domains
   - Add your custom domain: `slotify.com`
   - Update DNS records at your domain provider

---

## Backend Deployment

### Option 1: VPS (Recommended for Full Control)

#### Providers
- DigitalOcean
- AWS EC2
- Linode
- Vultr
- Hetzner

#### Setup Instructions

1. **Create VPS**
   - Choose Linux OS (Ubuntu 22.04 recommended)
   - Minimum 2GB RAM, 1 vCPU
   - Note your server IP address

2. **Connect to Server**
   ```bash
   ssh root@your-server-ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Python
   apt install python3 python3-pip python3-venv -y
   
   # Install MySQL Client
   apt install mysql-client -y
   
   # Install Nginx (for reverse proxy)
   apt install nginx -y
   ```

4. **Clone and Setup Backend**
   ```bash
   cd /var/www
   git clone https://github.com/your-username/slotify-backend.git
   cd slotify-backend
   
   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

5. **Configure Environment**
   ```bash
   cp .env.example .env.production
   nano .env.production
   ```
   
   Update with production values:
   ```env
   DATABASE_URL=mysql+pymysql://user:password@your-db-host:3306/slotify_prod
   SMTP_USER=noreply@slotify.com
   SMTP_PASSWORD=your-send-grid-key
   FRONTEND_URL=https://slotify.vercel.app
   BACKEND_URL=https://api.slotify.com
   ENVIRONMENT=production
   DEBUG=False
   ```

6. **Set up Nginx Reverse Proxy**
   ```bash
   sudo nano /etc/nginx/sites-available/slotify
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name api.slotify.com;
   
       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
   
   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/slotify /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Install SSL Certificate** (Let's Encrypt)
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d api.slotify.com
   ```

8. **Setup Systemd Service**
   ```bash
   sudo nano /etc/systemd/system/slotify-backend.service
   ```
   
   Add:
   ```ini
   [Unit]
   Description=Slotify Backend
   After=network.target
   
   [Service]
   Type=notify
   User=www-data
   WorkingDirectory=/var/www/slotify-backend
   Environment="PATH=/var/www/slotify-backend/venv/bin"
   EnvironmentFile=/var/www/slotify-backend/.env.production
   ExecStart=/var/www/slotify-backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
   Restart=always
   RestartSec=10
   
   [Install]
   WantedBy=multi-user.target
   ```
   
   Enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable slotify-backend
   sudo systemctl start slotify-backend
   sudo systemctl status slotify-backend
   ```

### Option 2: Heroku (Simpler, Costs More)

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create slotify-backend`
4. Add MySQL add-on: `heroku addons:create cleardb:ignite`
5. Set environment variables: `heroku config:set FRONTEND_URL=... BACKEND_URL=...`
6. Deploy: `git push heroku main`

---

## Environment Variables

### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://api.slotify.com
VITE_APP_NAME=Slotify
```

### Backend (.env.production)
```env
DATABASE_URL=mysql+pymysql://user:password@host:3306/slotify_prod
SMTP_USER=noreply@slotify.com
SMTP_PASSWORD=your-password
FRONTEND_URL=https://slotify.vercel.app
BACKEND_URL=https://api.slotify.com
ENVIRONMENT=production
DEBUG=False
```

---

## Database Setup

### Local Development
```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS slotify_dev;"
```

### Production (Cloud)

#### Option 1: AWS RDS
1. Go to AWS Console → RDS → Create Database
2. Choose MySQL 8.0+
3. Configure Multi-AZ for reliability
4. Get endpoint: `slotify-db.xxxxx.us-east-1.rds.amazonaws.com`
5. Create database: `slotify_prod`
6. Update `.env.production`:
   ```
   DATABASE_URL=mysql+pymysql://admin:password@slotify-db.xxxxx.us-east-1.rds.amazonaws.com:3306/slotify_prod
   ```

#### Option 2: DigitalOcean Managed Database
1. Create Managed MySQL Database
2. Copy connection string
3. Create database cluster with backups

#### Option 3: PlanetScale (MySQL-compatible, serverless)
1. Sign up at https://planetscale.com
2. Create database
3. Get connection string
4. Update `.env.production`

---

## Monitoring & Maintenance

### Logs
```bash
# Backend logs
sudo journalctl -u slotify-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Backups
```bash
# Manual backup
mysqldump -u user -p -h host database_name > backup.sql

# Restore
mysql -u user -p -h host database_name < backup.sql
```

### Health Checks
- Monitor API: https://api.slotify.com/docs
- Monitor Frontend: https://slotify.vercel.app
- Check database connectivity

---

## Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` in backend `.env`
- Check browser console for exact error
- Ensure origin matches exactly (http/https matters)

### Database Connection Errors
- Test connection: `mysql -u user -p -h host`
- Verify credentials in `.env`
- Check firewall rules allow MySQL port 3306

### API Not Responding
- Check backend service: `systemctl status slotify-backend`
- Check Nginx: `sudo systemctl status nginx`
- View logs: `journalctl -u slotify-backend -n 50`

---

## Support
For issues, check:
- Backend logs on server
- Vercel deployment logs
- AWS/Database provider console
