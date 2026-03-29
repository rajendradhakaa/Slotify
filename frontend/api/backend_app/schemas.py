from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import time, datetime


# ---- User Schemas ----
class UserBase(BaseModel):
    name: str
    email: str
    timezone: str = "Asia/Kolkata"


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    timezone: Optional[str] = None


# ---- Event Type Schemas ----
class EventTypeBase(BaseModel):
    name: str
    duration: int
    slug: str
    color: str = "#0069FF"
    is_active: bool = True


class EventTypeCreate(EventTypeBase):
    pass


class EventTypeUpdate(BaseModel):
    name: Optional[str] = None
    duration: Optional[int] = None
    slug: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None


class EventTypeResponse(EventTypeBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---- Availability Schemas ----
class AvailabilityRuleBase(BaseModel):
    day_of_week: int
    start_time: str  # "HH:MM" format
    end_time: str    # "HH:MM" format
    is_active: bool = True


class AvailabilityRuleCreate(AvailabilityRuleBase):
    pass


class AvailabilityRuleResponse(BaseModel):
    id: int
    user_id: int
    day_of_week: int
    start_time: str
    end_time: str
    is_active: bool

    class Config:
        from_attributes = True


class AvailabilityBulkUpdate(BaseModel):
    rules: List[AvailabilityRuleCreate]


class TimeSlot(BaseModel):
    time: str  # "HH:MM" format
    datetime_utc: str  # ISO format


class AvailableSlotsResponse(BaseModel):
    date: str
    timezone: str
    slots: List[TimeSlot]


# ---- Booking Schemas ----
class BookingCreate(BaseModel):
    event_type_id: int
    invitee_name: str
    invitee_email: str
    start_time: str  # ISO datetime string


class BookingResponse(BaseModel):
    id: int
    event_type_id: int
    invitee_name: str
    invitee_email: str
    start_time: datetime
    end_time: datetime
    status: str
    created_at: datetime
    event_type_name: Optional[str] = None
    event_type_duration: Optional[int] = None

    class Config:
        from_attributes = True
