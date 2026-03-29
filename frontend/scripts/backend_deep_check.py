import datetime
import json
import requests

BASE = 'https://slotify-iota.vercel.app'
T = 45
results = []


def add(name, ok, detail=''):
    results.append({'name': name, 'ok': bool(ok), 'detail': detail})


def req(method, path, **kwargs):
    try:
        r = requests.request(method, BASE + path, timeout=T, **kwargs)
        return r
    except Exception as e:
        add(f'{method} {path}', False, str(e))
        return None

# Health and static routes
for p in ['/', '/event-types', '/meetings', '/availability', '/u/rajendradhaka']:
    r = req('GET', p)
    add(f'GET {p}', r is not None and r.status_code == 200, f'status={getattr(r, "status_code", "err")}')

# User endpoints (both singular/plural)
for p in ['/api/user/me', '/api/users/me']:
    r = req('GET', p)
    add(f'GET {p}', r is not None and r.status_code == 200, f'status={getattr(r, "status_code", "err")}')

# Event type CRUD full cycle
slug = 'deep-' + datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')
payload = {'name': 'Deep Check', 'duration': 30, 'slug': slug, 'color': '#1457FF', 'is_active': True}
created = None
r = req('POST', '/api/event-types', json=payload)
add('POST /api/event-types', r is not None and r.status_code == 201, f'status={getattr(r, "status_code", "err")}')
if r is not None and r.status_code == 201:
    created = r.json()

if created and 'id' in created:
    et_id = created['id']
    r = req('GET', f'/api/event-types/{et_id}')
    add('GET /api/event-types/{id}', r is not None and r.status_code == 200, f'status={getattr(r, "status_code", "err")}')

    r = req('PUT', f'/api/event-types/{et_id}', json={'name': 'Deep Check Updated', 'duration': 45, 'is_active': True})
    add('PUT /api/event-types/{id}', r is not None and r.status_code == 200, f'status={getattr(r, "status_code", "err")}')

    r = req('GET', f'/api/event-types/slug/{slug}')
    add('GET /api/event-types/slug/{slug}', r is not None and r.status_code == 200, f'status={getattr(r, "status_code", "err")}')

# Negative slug uniqueness
r = req('POST', '/api/event-types', json=payload)
add('POST /api/event-types duplicate slug', r is not None and r.status_code == 400, f'status={getattr(r, "status_code", "err")}')

# Availability endpoints
r = req('GET', '/api/availability')
rules = []
add('GET /api/availability', r is not None and r.status_code == 200, f'status={getattr(r, "status_code", "err")}')
if r is not None and r.status_code == 200:
    try:
        rules = r.json()
    except Exception:
        rules = []

if isinstance(rules, list) and rules:
    wr = {'rules': [{'day_of_week': x['day_of_week'], 'start_time': x['start_time'], 'end_time': x['end_time'], 'is_active': x['is_active']} for x in rules]}
    r = req('PUT', '/api/availability', json=wr)
    add('PUT /api/availability', r is not None and r.status_code == 200, f'status={getattr(r, "status_code", "err")}')

# Slots and slot check
if created and 'slug' in created:
    date = (datetime.datetime.utcnow() + datetime.timedelta(days=2)).strftime('%Y-%m-%d')
    r = req('GET', f"/api/availability/{created['slug']}/slots?date={date}")
    add('GET /api/availability/{slug}/slots', r is not None and r.status_code == 200, f'status={getattr(r, "status_code", "err")}')

    start = (datetime.datetime.utcnow() + datetime.timedelta(days=2)).replace(hour=10, minute=0, second=0, microsecond=0).isoformat()
    r = req('GET', f"/api/availability/{created['slug']}/check?start_time={start}")
    add('GET /api/availability/{slug}/check', r is not None and r.status_code == 200, f'status={getattr(r, "status_code", "err")}')

# Booking lifecycle and negative checks
book_event_id = created['id'] if created else None
booking = None
if book_event_id:
    future_start = (datetime.datetime.utcnow() + datetime.timedelta(days=2)).replace(hour=11, minute=0, second=0, microsecond=0).isoformat()
    bp = {'event_type_id': book_event_id, 'invitee_name': 'Deep QA', 'invitee_email': 'rajdhaka4927@gmail.com', 'start_time': future_start}
    r = req('POST', '/api/bookings', json=bp)
    add('POST /api/bookings', r is not None and r.status_code == 201, f'status={getattr(r, "status_code", "err")}')
    if r is not None and r.status_code == 201:
        booking = r.json()

    # duplicate same slot should conflict
    r = req('POST', '/api/bookings', json=bp)
    add('POST /api/bookings duplicate slot', r is not None and r.status_code in (400, 409), f'status={getattr(r, "status_code", "err")}')

# past booking should fail
if book_event_id:
    past_start = (datetime.datetime.utcnow() - datetime.timedelta(days=1)).replace(hour=11, minute=0, second=0, microsecond=0).isoformat()
    bp2 = {'event_type_id': book_event_id, 'invitee_name': 'Deep QA', 'invitee_email': 'rajdhaka4927@gmail.com', 'start_time': past_start}
    r = req('POST', '/api/bookings', json=bp2)
    add('POST /api/bookings past time', r is not None and r.status_code == 400, f'status={getattr(r, "status_code", "err")}')

r = req('GET', '/api/bookings')
add('GET /api/bookings', r is not None and r.status_code == 200, f'status={getattr(r, "status_code", "err")}')

if booking and 'id' in booking:
    bid = booking['id']
    r = req('GET', f'/api/bookings/{bid}')
    add('GET /api/bookings/{id}', r is not None and r.status_code == 200, f'status={getattr(r, "status_code", "err")}')

    r = req('PATCH', f'/api/bookings/{bid}/cancel')
    add('PATCH /api/bookings/{id}/cancel', r is not None and r.status_code == 200, f'status={getattr(r, "status_code", "err")}')

# Email endpoint
r = req('POST', '/api/bookings/test-email?test_email=rajdhaka4927@gmail.com')
add('POST /api/bookings/test-email', r is not None and r.status_code == 200 and 'success' in (r.text or '').lower(), f'status={getattr(r, "status_code", "err")}')

# Cleanup created event
if created and 'id' in created:
    r = req('DELETE', f"/api/event-types/{created['id']}")
    add('DELETE /api/event-types/{id}', r is not None and r.status_code == 204, f'status={getattr(r, "status_code", "err")}')

passed = sum(1 for x in results if x['ok'])
print(json.dumps(results, indent=2))
print(f'passed {passed} of {len(results)} checks')
