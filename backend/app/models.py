from sqlalchemy import Column, Integer, String, Boolean, Time, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    auth_provider = Column(String(50), nullable=False, default="local")
    timezone = Column(String(100), nullable=False, default="Asia/Kolkata")
    created_at = Column(DateTime, default=datetime.utcnow)

    event_types = relationship("EventType", back_populates="user", cascade="all, delete-orphan")
    availability_rules = relationship("AvailabilityRule", back_populates="user", cascade="all, delete-orphan")

class EventType(Base):
    __tablename__ = "event_types"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    duration = Column(Integer, nullable=False)  # in minutes
    slug = Column(String(255), unique=True, nullable=False)
    color = Column(String(7), default="#0069FF")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="event_types")
    bookings = relationship("Booking", back_populates="event_type", cascade="all, delete-orphan")


class AvailabilityRule(Base):
    __tablename__ = "availability_rules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="availability_rules")

    __table_args__ = (
        UniqueConstraint("user_id", "day_of_week", name="uq_user_day"),
    )


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_type_id = Column(Integer, ForeignKey("event_types.id"), nullable=False)
    invitee_name = Column(String(255), nullable=False)
    invitee_email = Column(String(255), nullable=False)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False)
    status = Column(String(20), default="scheduled", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    event_type = relationship("EventType", back_populates="bookings")

    __table_args__ = (
        UniqueConstraint("event_type_id", "start_time", name="uq_event_start"),
    )
