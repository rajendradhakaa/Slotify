#!/usr/bin/env python3
"""
Reset availability times to defaults (Mon-Fri 9-5, Sat-Sun offline).
Run this if availability times are showing incorrectly.
"""

from app.database import SessionLocal
from app.models import AvailabilityRule
from datetime import time

def reset_availability():
    db = SessionLocal()
    try:
        # Delete all existing rules for user 1
        db.query(AvailabilityRule).filter(
            AvailabilityRule.user_id == 1
        ).delete()
        
        print("✓ Deleted old availability rules")
        
        # Create new default rules
        for day in range(5):  # Monday-Friday
            rule = AvailabilityRule(
                user_id=1,
                day_of_week=day,
                start_time=time(9, 0),
                end_time=time(17, 0),
                is_active=True,
            )
            db.add(rule)
        
        # Sat-Sun offline
        for day in [5, 6]:
            rule = AvailabilityRule(
                user_id=1,
                day_of_week=day,
                start_time=time(9, 0),
                end_time=time(17, 0),
                is_active=False,
            )
            db.add(rule)
        
        db.commit()
        print("✓ Reset availability to: Mon-Fri 9:00 AM - 5:00 PM (UTC)")
        print("✓ Saturday & Sunday set to offline")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_availability()
