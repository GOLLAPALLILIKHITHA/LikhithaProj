# Simple Service Request System

## How It Works

1. **User** selects service type (Plumbing, Electrical, etc.) and types their problem
2. **Admin** receives the request and assigns a worker
3. **User** gets notified and sees worker's contact number

## Backend (Complete ✅)

### API Endpoints

**User:**
- `POST /api/service-requests/create` - Submit request
- `GET /api/service-requests/my-requests` - View my requests

**Admin:**
- `GET /api/service-requests` - View all requests
- `POST /api/service-requests/:id/assign` - Assign worker
- `PUT /api/service-requests/:id/status` - Update status

### Database Fields

```javascript
{
  serviceType: "Plumbing",
  problemDescription: "Kitchen sink is leaking",
  userPhone: "9876543210",
  userAddress: "123 Main St (optional)",
  status: "pending/assigned/completed/cancelled",
  workerName: "John Plumber",
  workerPhone: "9988776655"
}
```

## Frontend (To Do)

### 1. Service Request Form
**Where:** Services page or modal

**Fields:**
- Service Type (dropdown: Plumbing, Electrical, Carpentry, etc.)
- Problem Description (textarea)
- Your Phone (text input)
- Your Address (textarea, optional)

**Submit:** POST to `/api/service-requests/create`

### 2. My Service Requests Page
**Where:** User account page

**Show:**
- List of requests
- Status (Pending/Assigned/Completed)
- Worker name and phone (when assigned)

**API:** GET `/api/service-requests/my-requests`

### 3. Admin Service Requests Page
**Where:** Admin dashboard

**Show:**
- All service requests
- Filter by status
- Assign worker button

**Assign Worker Form:**
- Worker Name
- Worker Phone
- Admin Notes (optional)

**API:** 
- GET `/api/service-requests`
- POST `/api/service-requests/:id/assign`

## Example API Calls

### User Submits Request
```javascript
POST /api/service-requests/create
{
  "serviceType": "Plumbing",
  "problemDescription": "Kitchen sink is leaking badly",
  "userPhone": "9876543210",
  "userAddress": "123 Main Street, Bangalore"
}
```

### Admin Assigns Worker
```javascript
POST /api/service-requests/1/assign
{
  "workerName": "John Plumber",
  "workerPhone": "9988776655",
  "adminNotes": "Experienced with sink repairs"
}
```

### User Views Requests
```javascript
GET /api/service-requests/my-requests

Response:
[
  {
    "id": 1,
    "serviceType": "Plumbing",
    "problemDescription": "Kitchen sink is leaking badly",
    "status": "assigned",
    "workerName": "John Plumber",
    "workerPhone": "9988776655",
    "createdAt": "2026-05-11"
  }
]
```

## That's It!

Simple and straightforward. No complicated scheduling, no ratings, no extra fields. Just:
1. User describes problem
2. Admin assigns worker
3. User contacts worker

Backend is done. Just need to build the 3 frontend pages.
