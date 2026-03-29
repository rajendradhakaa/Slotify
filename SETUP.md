# Slotify - Quick Setup Guide

## Development Environment Setup

### Prerequisites
- Node.js 18+ (Download from https://nodejs.org)
- Python 3.9+ (Download from https://www.python.org)
- MySQL 8.0+ running locally
- Git

---

## Frontend Setup (Vite + React)

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Create .env file from template**
   ```bash
   cp .env.example .env
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   - Frontend runs at: `http://localhost:5173`
   - API proxy configured at: `/api` → `http://localhost:8000`

5. **Build for production**
   ```bash
   npm run build
   ```

---

## Backend Setup (FastAPI)

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create .env file from template**
   ```bash
   cp .env.example .env
   ```

3. **Create MySQL database**
   ```bash
   mysql -u root -e "CREATE DATABASE IF NOT EXISTS slotify_dev;"
   ```

4. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

5. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

6. **Update database connection in .env**
   ```env
   DATABASE_URL=mysql+pymysql://root@localhost/slotify_dev
   ```

7. **Start backend server**
   ```bash
   uvicorn app.main:app --reload
   ```
   - Backend runs at: `http://localhost:8000`
   - API docs at: `http://localhost:8000/docs`

---

## Environment Variables

### Frontend (.env)
```env
# Development API - proxied by Vite
VITE_API_BASE_URL=/api
VITE_APP_NAME=Slotify
```

### Backend (.env)
```env
# Local MySQL Database
DATABASE_URL=mysql+pymysql://root@localhost/slotify_dev

# Email (use Gmail App Password)
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Backend URL
BACKEND_URL=http://localhost:8000

# Development mode
ENVIRONMENT=development
DEBUG=True
```

---

## Testing the Setup

1. **Open frontend**
   - http://localhost:5173

2. **Test API**
   - http://localhost:8000/docs (Swagger UI)
   - Try: GET `/event-types`

3. **Check database**
   ```bash
   mysql -u root slotify_dev
   SHOW TABLES;
   SELECT * FROM user;
   ```

---

## Common Issues

### "Module not found: axios"
```bash
npm install axios
```

### "Connection refused: MySQL"
- Check MySQL is running: `mysql -u root`
- Update DATABASE_URL in .env
- Verify database exists: `CREATE DATABASE slotify_dev;`

### "CORS error in browser"
- Check `FRONTEND_URL` in backend .env matches exactly
- Look at browser console for detailed error

### "Port 5173 already in use"
```bash
# Change port in vite.config.js or use:
npm run dev -- --port 3000
```

---

## Project Structure

```
slotify/
├── frontend/                 # Vite + React
│   ├── src/
│   │   ├── api/             # API client (axios)
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utilities
│   ├── .env                 # Development env
│   ├── .env.production      # Production env
│   ├── vite.config.js       # Vite config
│   └── vercel.json          # Vercel deployment config
│
├── backend/                 # FastAPI
│   ├── app/
│   │   ├── main.py         # FastAPI app
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── database.py     # Database config
│   │   ├── crud.py         # DB operations
│   │   └── routers/        # API endpoints
│   ├── .env                # Development env
│   ├── .env.production     # Production env
│   ├── requirements.txt    # Python dependencies
│   └── app.asgi            # Gunicorn entry point (for production)
│
├── DEPLOYMENT.md           # Production deployment guide
├── SETUP.md               # This file
└── README.md              # Project overview
```

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Frontend deployment on Vercel
- Backend deployment on VPS/Cloud
- Environment setup
- Database configuration

---

## Commands Reference

### Frontend
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Backend
```bash
# Activate venv first
source venv/bin/activate

# Development
uvicorn app.main:app --reload

# Production
gunicorn app.main:app -w 4 -b 0.0.0.0:8000
```

---

## Need Help?

1. Check `.env.example` files for all available variables
2. Review [DEPLOYMENT.md](DEPLOYMENT.md) for production issues
3. Check API docs at http://localhost:8000/docs
4. Review browser console for client-side errors

Happy scheduling! 🎉
