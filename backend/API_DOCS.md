# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication Routes

### 1. Register User
* **URL:** `/auth/register`
* **Method:** `POST`
* **Access:** Public
* **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
* **Success Response (201):**
  ```json
  {
    "success": true,
    "_id": "60d5ecb8b3...123",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 2. Login User
* **URL:** `/auth/login`
* **Method:** `POST`
* **Access:** Public
* **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### 3. Get User Profile
* **URL:** `/auth/profile`
* **Method:** `GET`
* **Access:** Private (Requires Header: `Authorization: Bearer <token>`)

---

## Subscription Routes
*(All subscription routes require the Authorization Bearer token)*

### 1. Get All Subscriptions
* **URL:** `/subscriptions`
* **Method:** `GET`
* **Success Response (200):**
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "_id": "...",
        "serviceName": "Netflix",
        "category": "Entertainment",
        "price": 649,
        "renewalDate": "2026-05-15T00:00:00.000Z",
        "status": "Active"
      }
    ]
  }
  ```

### 2. Add New Subscription
* **URL:** `/subscriptions`
* **Method:** `POST`
* **Body:**
  ```json
  {
    "serviceName": "Netflix",
    "category": "Entertainment",
    "price": 649,
    "renewalDate": "2026-05-15",
    "status": "Active"
  }
  ```

### 3. Update Subscription
* **URL:** `/subscriptions/:id`
* **Method:** `PUT`
* **Body:** (Any fields to update)
  ```json
  {
    "status": "Paused",
    "price": 799
  }
  ```

### 4. Delete Subscription
* **URL:** `/subscriptions/:id`
* **Method:** `DELETE`

---

## Dashboard Routes
*(Requires Authorization Bearer token)*

### 1. Get Dashboard Stats
* **URL:** `/dashboard/stats`
* **Method:** `GET`
* **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "totalSubscriptions": 5,
      "activeCount": 4,
      "pausedCount": 1,
      "totalMonthlySpend": 2500,
      "totalYearlySpend": 30000,
      "upcomingRenewalsCount": 2,
      "categoryBreakdown": [
        { "category": "Entertainment", "total": 1200 },
        { "category": "Productivity", "total": 800 }
      ]
    }
  }
  ```
