from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, time, timedelta
from .. import crud, schemas, models
from ..database import get_db

router = APIRouter(prefix="/api/availability", tags=["Availability"])

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


@router.get("", response_model=list[schemas.AvailabilityRuleResponse])
def get_availability(db: Session = Depends(get_db)):
    rules = crud.get_availability_rules(db)
    result = []
    for rule in rules:
        result.append(schemas.AvailabilityRuleResponse(
            id=rule.id,
            user_id=rule.user_id,
            day_of_week=rule.day_of_week,
            start_time=rule.start_time.strftime("%H:%M"),
            end_time=rule.end_time.strftime("%H:%M"),
            is_active=rule.is_active,
        ))
    return result


@router.put("", response_model=list[schemas.AvailabilityRuleResponse])
def update_availability(data: schemas.AvailabilityBulkUpdate, db: Session = Depends(get_db)):
    rules_data = [r.model_dump() for r in data.rules]
    rules = crud.bulk_update_availability(db, user_id=1, rules=rules_data)
    result = []
    for rule in rules:
        result.append(schemas.AvailabilityRuleResponse(
            id=rule.id,
            user_id=rule.user_id,
            day_of_week=rule.day_of_week,
            start_time=rule.start_time.strftime("%H:%M"),
            end_time=rule.end_time.strftime("%H:%M"),
            is_active=rule.is_active,
        ))
    return result


@router.get("/{slug}/slots")
def get_available_slots(slug: str, date: str = Query(...), db: Session = Depends(get_db)):
    """Get available time slots for a specific event type on a given date."""
    # Find event type by slug
    event_type = crud.get_event_type_by_slug(db, slug)
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")

    # Parse date
    try:
        selected_date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    # Don't allow booking in the past
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    if selected_date < today:
        return {"date": date, "timezone": "UTC", "slots": []}

    # Get day of week (Python: Monday=0, Sunday=6)
    day_of_week = selected_date.weekday()

    # Get availability rule for this day
    user = crud.get_user(db, event_type.user_id)
    rule = db.query(models.AvailabilityRule).filter(
        models.AvailabilityRule.user_id == event_type.user_id,
        models.AvailabilityRule.day_of_week == day_of_week,
        models.AvailabilityRule.is_active == True,
    ).first()

    if not rule:
        return {"date": date, "timezone": user.timezone if user else "UTC", "slots": []}

    # Generate time slots based on availability and event duration
    duration = timedelta(minutes=event_type.duration)
    slots = []

    current_time = datetime.combine(selected_date.date(), rule.start_time)
    end_time = datetime.combine(selected_date.date(), rule.end_time)

    # Get already booked slots for this date FOR THE HOST
    booked = crud.get_booked_slots_for_user(db, event_type.user_id, selected_date)
    booked_ranges = [(b.start_time, b.end_time) for b in booked]

    # For today only: get current time in the user's timezone
    now = datetime.utcnow()
    if selected_date.date() == now.date():
        # Only apply time cutoff for today, not future dates
        minimum_time = now
    else:
        # For future dates, allow all times within business hours
        minimum_time = datetime.combine(selected_date.date(), time(0, 0))

    while current_time + duration <= end_time:
        slot_end = current_time + duration

        # Skip if in the past (only for today)
        if selected_date.date() == now.date() and current_time <= minimum_time:
            current_time += duration
            continue

        # Check if slot overlaps with any booking
        is_booked = any(
            current_time < booked_end and slot_end > booked_start
            for booked_start, booked_end in booked_ranges
        )

        if not is_booked:
            slots.append({
                "time": current_time.strftime("%H:%M"),
                "datetime": current_time.isoformat(),
            })

        current_time += duration

    return {
        "date": date,
        "timezone": user.timezone if user else "UTC",
        "slots": slots,
    }


@router.get("/{slug}/check")
def check_time_slot(slug: str, start_time: str = Query(...), db: Session = Depends(get_db)):
    """Validates an arbitrary time input against host availability rules and existing bookings."""
    event_type = crud.get_event_type_by_slug(db, slug)
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")

    try:
        dt = datetime.fromisoformat(start_time)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid datetime format")

    end_time = dt + timedelta(minutes=event_type.duration)
    
    # Run the exact same validation logic used during actual booking insertions
    result = crud.check_availability(db, event_type.user_id, dt, end_time)
    
    if "error" in result:
        return {"available": False, "reason": result["error"]}
        
    return {"available": True}
