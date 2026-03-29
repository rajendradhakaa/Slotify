from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import os
import smtplib
from email.message import EmailMessage
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


def send_confirmation_email(invitee_email: str, invitee_name: str, event_name: str, start_time: datetime, end_time: datetime):
    sender_email = os.getenv("SMTP_USER")
    sender_password = os.getenv("SMTP_PASSWORD")
    
    if not sender_email or not sender_password:
        print("SMTP credentials not configured. Skipping email send.")
        return

    # 1. Invitee Email
    msg_invitee = EmailMessage()
    msg_invitee['Subject'] = f"Confirmed: {event_name} with Rajendra Dhaka"
    msg_invitee['From'] = f"Rajendra Dhaka <{sender_email}>"
    msg_invitee['To'] = invitee_email

    formatted_start = start_time.strftime("%A, %B %d, %Y at %I:%M %p")
    formatted_end = end_time.strftime("%I:%M %p")

    content_invitee = f"""
    Hi {invitee_name},

    Your meeting has been scheduled successfully!

    Event: {event_name}
    When: {formatted_start} - {formatted_end} (UTC)

    If you need to reschedule or cancel this event, you can do so here:
    http://localhost:5173/book/{event_name.replace(" ", "-").lower()}

    Best regards,
    Slotify Team
    """
    msg_invitee.set_content(content_invitee)

    # 2. Host Email Notification
    msg_host = EmailMessage()
    msg_host['Subject'] = f"New Event Scheduled: {invitee_name} - {event_name}"
    msg_host['From'] = f"Slotify <{sender_email}>"
    msg_host['To'] = sender_email  # Send back to host

    content_host = f"""
    Hi Rajendra,

    A new event has been scheduled on your calendar!

    Invitee: {invitee_name} ({invitee_email})
    Event: {event_name}
    When: {formatted_start} - {formatted_end} (UTC)

    View your upcoming meetings on the Slotify dashboard.
    """
    msg_host.set_content(content_host)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg_invitee)
            server.send_message(msg_host)
        print(f"Confirmation emails sent to {invitee_email} and {sender_email}")
    except Exception as e:
        print(f"Failed to send emails: {e}")


@router.post("/test-email")
def test_email_config(test_email: str = "test@gmail.com"):
    """
    Test endpoint to verify email configuration works.
    Send a test email to verify SMTP settings are correct.
    """
    sender_email = os.getenv("SMTP_USER")
    sender_password = os.getenv("SMTP_PASSWORD")
    
    if not sender_email or not sender_password:
        return {
            "status": "error",
            "message": "SMTP credentials not configured in .env file",
            "required_vars": ["SMTP_USER", "SMTP_PASSWORD"]
        }

    msg = EmailMessage()
    msg['Subject'] = "Slotify - Test Email"
    msg['From'] = f"Slotify <{sender_email}>"
    msg['To'] = test_email

    msg.set_content("""
Hi,

This is a test email from Slotify to verify that email sending is working correctly.

If you received this, your email configuration is set up properly!

Best regards,
Slotify Team
    """)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg)
        return {
            "status": "success",
            "message": f"Test email sent successfully to {test_email}",
            "from": sender_email
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to send test email: {str(e)}",
            "error_type": type(e).__name__
        }


@router.post("", response_model=schemas.BookingResponse, status_code=201)
def create_booking(data: schemas.BookingCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):

    # Validate event type exists
    event_type = crud.get_event_type(db, data.event_type_id)
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")

    # Parse start time
    try:
        start_time = datetime.fromisoformat(data.start_time)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid datetime format")

    end_time = start_time + timedelta(minutes=event_type.duration)

    # Don't allow booking in the past
    if start_time <= datetime.utcnow():
        raise HTTPException(status_code=400, detail="Cannot book a time slot in the past")

    # Create booking (crud handles double-booking check)
    booking = crud.create_booking(
        db,
        event_type_id=data.event_type_id,
        invitee_name=data.invitee_name,
        invitee_email=data.invitee_email,
        start_time=start_time,
        end_time=end_time,
    )

    if booking is None:
        raise HTTPException(status_code=409, detail="This exact time slot overlaps with another booking.")
        
    if isinstance(booking, dict) and "error" in booking:
        raise HTTPException(status_code=400, detail=booking["error"])

    # Trigger email to invitee in the background
    background_tasks.add_task(
        send_confirmation_email,
        invitee_email=booking.invitee_email,
        invitee_name=booking.invitee_name,
        event_name=event_type.name,
        start_time=booking.start_time,
        end_time=booking.end_time
    )

    return schemas.BookingResponse(
        id=booking.id,
        event_type_id=booking.event_type_id,
        invitee_name=booking.invitee_name,
        invitee_email=booking.invitee_email,
        start_time=booking.start_time,
        end_time=booking.end_time,
        status=booking.status,
        created_at=booking.created_at,
        event_type_name=event_type.name,
        event_type_duration=event_type.duration,
    )


@router.get("", response_model=list[schemas.BookingResponse])
def list_bookings(
    upcoming: Optional[bool] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    bookings = crud.get_bookings(db, user_id=1, status=status, upcoming=upcoming)
    result = []
    for b in bookings:
        result.append(schemas.BookingResponse(
            id=b.id,
            event_type_id=b.event_type_id,
            invitee_name=b.invitee_name,
            invitee_email=b.invitee_email,
            start_time=b.start_time,
            end_time=b.end_time,
            status=b.status,
            created_at=b.created_at,
            event_type_name=b.event_type.name if b.event_type else None,
            event_type_duration=b.event_type.duration if b.event_type else None,
        ))
    return result


@router.get("/{booking_id}", response_model=schemas.BookingResponse)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    b = crud.get_booking(db, booking_id)
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    return schemas.BookingResponse(
        id=b.id,
        event_type_id=b.event_type_id,
        invitee_name=b.invitee_name,
        invitee_email=b.invitee_email,
        start_time=b.start_time,
        end_time=b.end_time,
        status=b.status,
        created_at=b.created_at,
        event_type_name=b.event_type.name if b.event_type else None,
        event_type_duration=b.event_type.duration if b.event_type else None,
    )


@router.patch("/{booking_id}/cancel", response_model=schemas.BookingResponse)
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    b = crud.cancel_booking(db, booking_id)
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    return schemas.BookingResponse(
        id=b.id,
        event_type_id=b.event_type_id,
        invitee_name=b.invitee_name,
        invitee_email=b.invitee_email,
        start_time=b.start_time,
        end_time=b.end_time,
        status=b.status,
        created_at=b.created_at,
        event_type_name=b.event_type.name if b.event_type else None,
        event_type_duration=b.event_type.duration if b.event_type else None,
    )
