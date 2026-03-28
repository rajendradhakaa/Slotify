# Calendly Clone

A full-stack scheduling platform replicating Calendly's core design and functionality.

## Tech Stack
* **Frontend:** React.js, Vite, React Router, Date-Fns, Axios, Lucide Icons
* **Backend:** FastAPI (Python), SQLAlchemy, PyMySQL
* **Database:** MySQL

## Features Supported
1. **Event Types Management:** Create, edit, and delete event types with unique URL slugs and durations.
2. **Availability Settings:** Configure Weekly Hours (Monday to Sunday, toggleable, with adjustable time ranges).
3. **Public Booking Page:** 
    - Month Calendar view preventing past-date selection.
    - Dynamic available time-slot generation preventing double-bookings.
    - Automatic timezone handling (backend parses UTC, frontend displays local time).
4. **Meetings Page:** Dashboard to view Upcoming and Past scheduled events, with the ability to Cancel meetings.

## Setup Instructions

### 1. Database Setup (MySQL)
Ensure MySQL is running locally.

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS calendly_clone;"
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
*Note: The FastAPI application securely creates all necessary tables using SQLAlchemy and seeds a default User and Schedule logic on startup.*

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to see the dashboard. Happy scheduling!
