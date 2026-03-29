from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import os
import smtplib
from email.message import EmailMessage
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


def get_public_base_url() -> str:
    raw_value = (
        (os.getenv("APP_BASE_URL") or "").strip()
        or (os.getenv("PUBLIC_BASE_URL") or "").strip()
        or (os.getenv("FRONTEND_URL") or "").strip()
    )

    if raw_value:
        candidates = [item.strip().rstrip("/") for item in raw_value.split(",") if item.strip()]
        for candidate in candidates:
            if "localhost" not in candidate and "127.0.0.1" not in candidate:
                return candidate
        return candidates[0] if candidates else "https://slotify-iota.vercel.app"

    return "https://slotify-iota.vercel.app"


def get_smtp_settings() -> dict:
    user = (os.getenv("SMTP_USER") or "").strip()
    password = (os.getenv("SMTP_PASSWORD") or "").strip()
    host = (os.getenv("SMTP_HOST") or "smtp.gmail.com").strip()
    port = int((os.getenv("SMTP_PORT") or "465").strip())
    use_tls = (os.getenv("SMTP_USE_TLS") or "false").strip().lower() in {"1", "true", "yes"}

    return {
        "user": user,
        "password": password,
        "host": host,
        "port": port,
        "use_tls": use_tls,
    }


def send_with_smtp(message: EmailMessage, smtp: dict) -> None:
    host = smtp["host"]
    port = smtp["port"]
    user = smtp["user"]
    password = smtp["password"]

    if smtp["use_tls"]:
        with smtplib.SMTP(host, port, timeout=20) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(user, password)
            server.send_message(message)
        return

    with smtplib.SMTP_SSL(host, port, timeout=20) as server:
        server.login(user, password)
        server.send_message(message)


def send_confirmation_email(
    invitee_email: str,
    invitee_name: str,
    event_name: str,
    event_slug: str,
    booking_id: int,
    start_time: datetime,
    end_time: datetime,
):
    smtp = get_smtp_settings()
    sender_email = smtp["user"]
    sender_password = smtp["password"]
    
    if not sender_email or not sender_password:
        print("SMTP credentials not configured. Skipping email send.")
        return

    # 1. Invitee Email
    msg_invitee = EmailMessage()
    msg_invitee['Subject'] = f"Booking Confirmed: {event_name}"
    msg_invitee['From'] = f"Rajendra Dhaka <{sender_email}>"
    msg_invitee['To'] = invitee_email

    formatted_start = start_time.strftime("%A, %B %d, %Y at %I:%M %p")
    formatted_end = end_time.strftime("%I:%M %p")
    base_url = get_public_base_url()
    booking_url = f"{base_url}/book/{event_slug}"
    confirmation_url = f"{base_url}/confirmation/{booking_id}"

    content_invitee = f"""Hello {invitee_name},

Your booking has been confirmed.

Meeting Details
- Event: {event_name}
- Date and time: {formatted_start} - {formatted_end} (UTC)
- Confirmation page: {confirmation_url}
- Booking page: {booking_url}

If you need to schedule another time, please use the booking page above.

Kind regards,
Rajendra Dhaka
"""
    msg_invitee.set_content(content_invitee)

    # 2. Host Email Notification
    msg_host = EmailMessage()
    msg_host['Subject'] = f"New Booking Scheduled: {event_name}"
    msg_host['From'] = f"Slotify <{sender_email}>"
    msg_host['To'] = sender_email  # Send back to host

    content_host = f"""Hello Rajendra,

A new booking has been scheduled.

Invitee: {invitee_name} ({invitee_email})
Event: {event_name}
Date and time: {formatted_start} - {formatted_end} (UTC)
Confirmation page: {confirmation_url}
Booking page: {booking_url}

Please review this meeting in your Slotify dashboard.
"""
    msg_host.set_content(content_host)

    try:
        send_with_smtp(msg_invitee, smtp)
        send_with_smtp(msg_host, smtp)
        print(f"Confirmation emails sent to {invitee_email} and {sender_email}")
    except Exception as e:
        print(f"Failed to send emails: {e}")


@router.post("/test-email")
def test_email_config(test_email: str = "test@gmail.com"):
    """
    Test endpoint to verify email configuration works.
    Send a test email to verify SMTP settings are correct.
    """
    smtp = get_smtp_settings()
    sender_email = smtp["user"]
    sender_password = smtp["password"]
    
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
        send_with_smtp(msg, smtp)
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
def create_booking(data: schemas.BookingCreate, db: Session = Depends(get_db)):

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

    # Send email synchronously for better reliability on serverless runtimes.
    # Booking success should not depend on SMTP availability.
    try:
        send_confirmation_email(
            invitee_email=booking.invitee_email,
            invitee_name=booking.invitee_name,
            event_name=event_type.name,
            event_slug=event_type.slug,
            booking_id=booking.id,
            start_time=booking.start_time,
            end_time=booking.end_time,
        )
    except Exception as error:
        print(f"Failed to send confirmation email for booking {booking.id}: {error}")

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
