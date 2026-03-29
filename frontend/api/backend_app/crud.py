from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, time, timedelta
from . import models


# ---- User CRUD ----
def get_user(db: Session, user_id: int = 1):
    return db.query(models.User).filter(models.User.id == user_id).first()


def update_user(db: Session, user_id: int, name: str = None, timezone: str = None):
    user = get_user(db, user_id)
    if not user:
        return None
    if name:
        user.name = name
    if timezone:
        user.timezone = timezone
    db.commit()
    db.refresh(user)
    return user


# ---- Event Type CRUD ----
def get_event_types(db: Session, user_id: int = 1):
    return db.query(models.EventType).filter(models.EventType.user_id == user_id).all()


def get_event_type(db: Session, event_type_id: int):
    return db.query(models.EventType).filter(models.EventType.id == event_type_id).first()


def get_event_type_by_slug(db: Session, slug: str):
    return db.query(models.EventType).filter(models.EventType.slug == slug).first()


def create_event_type(db: Session, user_id: int, name: str, duration: int, slug: str, color: str = "#0069FF", is_active: bool = True):
    event_type = models.EventType(
        user_id=user_id,
        name=name,
        duration=duration,
        slug=slug,
        color=color,
        is_active=is_active,
    )
    db.add(event_type)
    db.commit()
    db.refresh(event_type)
    return event_type


def update_event_type(db: Session, event_type_id: int, **kwargs):
    event_type = get_event_type(db, event_type_id)
    if not event_type:
        return None
    for key, value in kwargs.items():
        if value is not None:
            setattr(event_type, key, value)
    event_type.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(event_type)
    return event_type


def delete_event_type(db: Session, event_type_id: int):
    event_type = get_event_type(db, event_type_id)
    if not event_type:
        return False
    db.delete(event_type)
    db.commit()
    return True


# ---- Availability CRUD ----
def get_availability_rules(db: Session, user_id: int = 1):
    return db.query(models.AvailabilityRule).filter(
        models.AvailabilityRule.user_id == user_id
    ).order_by(models.AvailabilityRule.day_of_week).all()


def bulk_update_availability(db: Session, user_id: int, rules: list):
    # Delete existing rules
    db.query(models.AvailabilityRule).filter(
        models.AvailabilityRule.user_id == user_id
    ).delete()

    # Insert new rules
    for rule in rules:
        hours_start, mins_start = map(int, rule["start_time"].split(":"))
        hours_end, mins_end = map(int, rule["end_time"].split(":"))
        db_rule = models.AvailabilityRule(
            user_id=user_id,
            day_of_week=rule["day_of_week"],
            start_time=time(hours_start, mins_start),
            end_time=time(hours_end, mins_end),
            is_active=rule.get("is_active", True),
        )
        db.add(db_rule)

    db.commit()
    return get_availability_rules(db, user_id)


# ---- Booking CRUD ----
def get_bookings(db: Session, user_id: int = 1, status: str = None, upcoming: bool = None):
    query = db.query(models.Booking).join(models.EventType).filter(
        models.EventType.user_id == user_id
    )
    if status:
        query = query.filter(models.Booking.status == status)
    if upcoming is True:
        query = query.filter(models.Booking.start_time >= datetime.utcnow())
    elif upcoming is False:
        query = query.filter(models.Booking.start_time < datetime.utcnow())

    return query.order_by(models.Booking.start_time).all()


def get_booking(db: Session, booking_id: int):
    return db.query(models.Booking).filter(models.Booking.id == booking_id).first()


def check_availability(db: Session, user_id: int, start_time: datetime, end_time: datetime):
    # 1. Verify against explicit Host Availability Rules
    day_of_week = start_time.weekday()
    rule = db.query(models.AvailabilityRule).filter(
        models.AvailabilityRule.user_id == user_id,
        models.AvailabilityRule.day_of_week == day_of_week,
        models.AvailabilityRule.is_active == True,
    ).first()

    if not rule:
        return {"error": "The host is exactly unavailable on this day."}

    requested_start_time = start_time.time()
    requested_end_time = end_time.time()

    if requested_start_time < rule.start_time or requested_end_time > rule.end_time:
        return {"error": f"Time outside available hours: {rule.start_time.strftime('%H:%M')} to {rule.end_time.strftime('%H:%M')}."}

    # 3. Check for overlapping bookings for THIS USER (double-booking prevention for the host)
    existing = db.query(models.Booking).join(models.EventType).filter(
        and_(
            models.EventType.user_id == user_id,
            models.Booking.status == "scheduled",
            models.Booking.start_time < end_time,
            models.Booking.end_time > start_time,
        )
    ).first()

    if existing:
        return {"error": "This exact time slot overlaps with another scheduled meeting."}
        
    return {"ok": True}

def create_booking(db: Session, event_type_id: int, invitee_name: str, invitee_email: str, start_time: datetime, end_time: datetime):
    # Fetch event type to find the host (user_id)
    event_type = db.query(models.EventType).filter(models.EventType.id == event_type_id).first()
    if not event_type:
        return None
    user_id = event_type.user_id

    # 2. Lock the User row to serialize ALL booking attempts for this host across ANY event type
    db.query(models.User).filter(models.User.id == user_id).with_for_update().first()

    # Re-verify inside the lock to ensure concurrency safety
    check = check_availability(db, user_id, start_time, end_time)
    if "error" in check:
        return check

    booking = models.Booking(
        event_type_id=event_type_id,
        invitee_name=invitee_name,
        invitee_email=invitee_email,
        start_time=start_time,
        end_time=end_time,
        status="scheduled",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def cancel_booking(db: Session, booking_id: int):
    booking = get_booking(db, booking_id)
    if not booking:
        return None
    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return booking


def get_booked_slots_for_user(db: Session, user_id: int, date: datetime):
    """Get all booked (scheduled) time ranges for a given user (host) on a specific date, across all their event types."""
    start_of_day = datetime(date.year, date.month, date.day, 0, 0, 0)
    end_of_day = datetime(date.year, date.month, date.day, 23, 59, 59)

    return db.query(models.Booking).join(models.EventType).filter(
        and_(
            models.EventType.user_id == user_id,
            models.Booking.status == "scheduled",
            models.Booking.start_time >= start_of_day,
            models.Booking.start_time <= end_of_day,
        )
    ).all()
