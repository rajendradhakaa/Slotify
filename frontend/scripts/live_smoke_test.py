import datetime
import json
import requests

BASE_URL = "https://slotify-iota.vercel.app"
TIMEOUT = 40

results = []


def check(name, ok, detail=""):
    results.append({"name": name, "ok": bool(ok), "detail": detail})


def try_request(name, method, path, **kwargs):
    try:
        response = requests.request(method, f"{BASE_URL}{path}", timeout=TIMEOUT, **kwargs)
        check(name, response.status_code < 400, f"status={response.status_code}")
        return response
    except Exception as exc:
        check(name, False, str(exc))
        return None


# Public routes
for page in ["/", "/event-types", "/meetings", "/availability", "/u/rajendradhaka"]:
    try_request(f"GET {page}", "GET", page)

# Basic user/profile API
try_request("GET /api/users/me", "GET", "/api/users/me")

# Event types list + create + update + slug fetch
event_types_response = try_request("GET /api/event-types", "GET", "/api/event-types")
existing_event_types = []
if event_types_response is not None and event_types_response.status_code == 200:
    try:
        existing_event_types = event_types_response.json()
    except Exception:
        existing_event_types = []

slug = f"qa-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
create_payload = {
    "name": f"QA Event {slug[-6:]}",
    "duration": 30,
    "slug": slug,
    "color": "#1457FF",
    "is_active": True,
}
create_response = try_request("POST /api/event-types", "POST", "/api/event-types", json=create_payload)
created_event = None
if create_response is not None and create_response.status_code == 201:
    try:
        created_event = create_response.json()
    except Exception:
        created_event = None

if created_event and "id" in created_event:
    event_id = created_event["id"]
    update_payload = {"name": f"{created_event['name']} Updated", "duration": 45}
    try_request("PUT /api/event-types/{id}", "PUT", f"/api/event-types/{event_id}", json=update_payload)
    try_request("GET /api/event-types/slug/{slug}", "GET", f"/api/event-types/slug/{slug}")

# Availability list + put (idempotent writeback)
availability_response = try_request("GET /api/availability", "GET", "/api/availability")
if availability_response is not None and availability_response.status_code == 200:
    try:
        rules = availability_response.json()
        if isinstance(rules, list) and rules:
            put_payload = {
                "rules": [
                    {
                        "day_of_week": rule["day_of_week"],
                        "start_time": rule["start_time"],
                        "end_time": rule["end_time"],
                        "is_active": rule["is_active"],
                    }
                    for rule in rules
                ]
            }
            try_request("PUT /api/availability", "PUT", "/api/availability", json=put_payload)
    except Exception as exc:
        check("PUT /api/availability", False, f"payload-build-error: {exc}")

# Bookings lifecycle
chosen_event_id = None
chosen_slug = None
if created_event and "id" in created_event:
    chosen_event_id = created_event["id"]
    chosen_slug = created_event.get("slug")
elif existing_event_types:
    chosen_event_id = existing_event_types[0].get("id")
    chosen_slug = existing_event_types[0].get("slug")

if chosen_slug:
    check_response = try_request(
        "GET /api/availability/{slug}/check",
        "GET",
        f"/api/availability/{chosen_slug}/check",
        params={
            "start_time": (
                datetime.datetime.utcnow()
                .replace(hour=10, minute=0, second=0, microsecond=0)
                + datetime.timedelta(days=2)
            ).isoformat()
        },
    )

if chosen_event_id:
    start_dt = (
        datetime.datetime.utcnow()
        .replace(hour=10, minute=0, second=0, microsecond=0)
        + datetime.timedelta(days=2)
    ).isoformat()
    booking_payload = {
        "event_type_id": chosen_event_id,
        "invitee_name": "QA Bot",
        "invitee_email": "rajdhaka4927@gmail.com",
        "start_time": start_dt,
    }
    booking_response = try_request("POST /api/bookings", "POST", "/api/bookings", json=booking_payload)
    created_booking = None
    if booking_response is not None and booking_response.status_code == 201:
        try:
            created_booking = booking_response.json()
        except Exception:
            created_booking = None

    try_request("GET /api/bookings", "GET", "/api/bookings")

    if created_booking and "id" in created_booking:
        booking_id = created_booking["id"]
        try_request("GET /api/bookings/{id}", "GET", f"/api/bookings/{booking_id}")
        try_request("PATCH /api/bookings/{id}/cancel", "PATCH", f"/api/bookings/{booking_id}/cancel")

# Email test endpoint
try_request(
    "POST /api/bookings/test-email",
    "POST",
    "/api/bookings/test-email",
    params={"test_email": "rajdhaka4927@gmail.com"},
)

passed = sum(1 for item in results if item["ok"])
print(json.dumps(results, indent=2))
print(f"passed {passed} of {len(results)} checks")
