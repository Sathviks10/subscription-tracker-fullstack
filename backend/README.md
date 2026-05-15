# Subscription Tracker Backend

A complete production-ready RESTful API backend for the Subscription Tracker application. Built with Node.js, Express, MongoDB, and secured with JWT.

## Features
* **Authentication**: User registration, login, and profile management with JWT.
* **Subscription Management**: Full CRUD (Create, Read, Update, Delete) for user subscriptions.
* **Dashboard Analytics**: Calculates monthly spend, category breakdown, active subscriptions, and due dates.
* **Security**: Password hashing (bcryptjs), secure HTTP headers (helmet), CORS protection, and rate limiting.

## Project Structure
```
backend/
├── config/
│   └── db.js                 # MongoDB connection setup
├── controllers/
│   ├── authController.js     # User auth logic
│   ├── dashboardController.js# Dashboard statistics logic
│   └── subscriptionController.js # Subscription CRUD logic
├── middleware/
│   ├── authMiddleware.js     # JWT protection middleware
│   └── errorMiddleware.js    # Global error handler
├── models/
│   ├── Subscription.js       # Mongoose schema for subscriptions
│   └── User.js               # Mongoose schema for users
├── routes/
│   ├── authRoutes.js         # Endpoints for auth
│   ├── dashboardRoutes.js    # Endpoints for stats
│   └── subscriptionRoutes.js # Endpoints for subscriptions
├── .env.example              # Environment variables template
├── API_DOCS.md               # Detailed API Documentation
├── package.json              # Project dependencies
├── Postman_Collection.json   # Ready-to-import Postman workspace
└── server.js                 # Main application entry point
```

## Setup & Installation (Local Development)

1. **Prerequisites**: Ensure you have Node.js and MongoDB installed (or a MongoDB Atlas connection string).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   * Rename `.env.example` to `.env`
   * Fill in your MongoDB connection string and a secret key for JWT.
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/subtrack?retryWrites=true&w=majority
   JWT_SECRET=your_random_secret_string
   NODE_ENV=development
   ```
4. **Run the server**:
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000`.

## Deployment Guide (Render)

1. Push your `backend` folder to a GitHub repository.
2. Go to [Render.com](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the following configurations:
   * **Root Directory**: `backend` (if it's inside a monorepo, otherwise leave blank if repo is just backend)
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
5. Add the Environment Variables (`MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`).
6. Click **Create Web Service**. Your API will be live in a few minutes.

## Frontend Integration Guide

In your Next.js/React frontend, create an Axios instance or use fetch pointing to the backend URL:
```javascript
// Example API utility
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## Viva Questions & Answers

**Q1: What is JWT and how is it used in this project?**
**A**: JSON Web Token (JWT) is an open standard used to securely transmit information between parties as a JSON object. In this project, when a user logs in, the server generates a JWT containing the user's ID and signs it with a secret key. The frontend stores this token and sends it in the `Authorization` header (`Bearer <token>`) for subsequent requests to access protected routes.

**Q2: What is the purpose of Mongoose in this backend?**
**A**: Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It manages relationships between data, provides schema validation, and translates between objects in code and the representation of those objects in MongoDB.

**Q3: How are passwords secured before saving to the database?**
**A**: We use the `bcryptjs` library. In the `User.js` model, there is a Mongoose `pre-save` hook that intercepts the user document before it is saved to the database. It generates a salt and hashes the password, ensuring plain-text passwords are never stored.

**Q4: What is the role of the `errorMiddleware.js`?**
**A**: It provides a centralized way to handle errors across the application. Instead of writing `try-catch` blocks with custom error responses in every controller, we use `next(error)` and let the middleware format the error message nicely (e.g., handling Mongoose validation errors or duplicate keys) and return a consistent JSON response to the frontend.

**Q5: How do we calculate the Dashboard statistics?**
**A**: In `dashboardController.js`, we fetch all subscriptions belonging to the logged-in user. We use JavaScript array methods like `filter` (to separate active vs paused), `reduce` (to sum up total monthly spend and aggregate category totals), and Date objects to find subscriptions renewing within the next 7 days.
