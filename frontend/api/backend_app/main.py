from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models import User, EventType, AvailabilityRule
from .routers import event_types, availability, bookings, users
from datetime import time
import os

app = FastAPI(title="Slotify Clone API", version="1.0.0")

# CORS - Load from environment
allowed_origins = os.getenv("FRONTEND_URL", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(event_types.router)
app.include_router(availability.router)
app.include_router(bookings.router)
app.include_router(users.router)
app.include_router(users.compat_router)


@app.on_event("startup")
def startup():
    """Create tables and seed default data on startup."""
    Base.metadata.create_all(bind=engine)

    # Seed default user if not exists
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == 1).first()
        if not user:
            user = User(
                name="Rajendra Dhaka",
                email="rajendra@example.com",
                timezone="Asia/Kolkata",
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Seed default availability (Mon-Fri 9:00-17:00)
            for day in range(5):  # 0=Monday to 4=Friday
                rule = AvailabilityRule(
                    user_id=user.id,
                    day_of_week=day,
                    start_time=time(9, 0),
                    end_time=time(17, 0),
                    is_active=True,
                )
                db.add(rule)

            # Seed Saturday and Sunday as inactive
            for day in [5, 6]:
                rule = AvailabilityRule(
                    user_id=user.id,
                    day_of_week=day,
                    start_time=time(9, 0),
                    end_time=time(17, 0),
                    is_active=False,
                )
                db.add(rule)

            db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Slotify API", "docs": "/docs"}
