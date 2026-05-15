# SubTrack – Stateless Subscription Tracker

SubTrack is a modern stateless subscription tracking dashboard built using Next.js, React, Tailwind CSS, and lucide-react icons.

The application helps users temporarily track recurring subscriptions, monthly spending, upcoming renewals, active services, and paused subscriptions through a clean and responsive SaaS-style dashboard.

This project was developed as part of the **Modern Application Development – CSD303A Assignment Part 2: Full Stack Application Mini Project**.

---

## Live Demo

Deployed Website:  
https://subscription-tracker-two-psi.vercel.app/

---

## Project Overview

SubTrack is designed for users who subscribe to multiple recurring services such as OTT platforms, productivity tools, cloud storage, gym memberships, phone bills, education apps, and other monthly plans.

Instead of using spreadsheets or manually remembering renewal dates, users can add subscriptions into a clean dashboard and instantly view total monthly spending, upcoming renewals, active subscriptions, and paused services.

The application is intentionally stateless. All data is stored temporarily in React state and resets when the page is refreshed.

---

## Tagline

**Know exactly where your money goes every month.**

---

## Problem Statement

Many users pay for several recurring services every month. These payments may appear small individually, but together they can become difficult to track. Users often forget renewal dates, lose awareness of total monthly spending, or continue paying for services they no longer actively use.

SubTrack solves this problem by providing a simple and visually clear subscription tracking dashboard where users can add subscriptions, monitor monthly costs, identify upcoming renewals, pause or resume services, and understand spending by category.

---

## Objectives

- To design a modern and responsive subscription tracking dashboard.
- To allow users to add, delete, pause, and resume subscriptions.
- To calculate total monthly subscription spending.
- To identify subscriptions due within the next 7 days.
- To provide category-wise subscription spending insights.
- To demonstrate frontend development using Next.js, React, and Tailwind CSS.
- To simulate temporary data handling using React state.
- To deploy the application successfully using Vercel.

---

## Features Implemented

### Subscription Management

- Add a subscription with:
  - Service name
  - Monthly price
  - Category
  - Billing date
  - Status
- Delete subscriptions.
- Pause active subscriptions.
- Resume paused subscriptions.
- Filter subscriptions by:
  - All
  - Active
  - Paused
  - Due Soon

---

### Dashboard Summary

The dashboard displays:

- Total Monthly Spend
- Active Subscriptions
- Due This Week
- Paused Subscriptions

---

### Subscription Cards

Each subscription card displays:

- Service name
- Monthly price
- Category badge
- Billing date
- Days until renewal
- Subscription status
- Pause/Resume action
- Delete action

---

### Category Analytics

- Category-wise subscription spending breakdown.
- Visual representation of monthly spend by category.
- Helps users understand where their subscription money is going.

---

### Demo Controls

- Load Demo Data
- Clear All
- Demo mode note showing that subscriptions reset on refresh

---

### User Experience

- Friendly validation messages.
- Success toast after adding or loading subscriptions.
- Clean and modern SaaS-style interface.
- Responsive design for desktop and mobile.
- Indian-user friendly rupee formatting.
- Helpful empty states when no subscriptions are available.

---

## Tech Stack

| Area | Technology Used |
|---|---|
| Framework | Next.js |
| Frontend Library | React |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| State Handling | React `useState` |
| Deployment | Vercel |

---

## Frontend Implementation

The frontend is built using Next.js and React. The UI follows a modern dashboard layout with reusable components, subscription cards, summary sections, filters, action buttons, and responsive styling.

Tailwind CSS is used to create a clean and polished interface with proper spacing, rounded cards, modern typography, and mobile-friendly layouts.

Key frontend sections include:

- Header section
- Summary dashboard cards
- Add subscription form
- Category spending breakdown
- Subscription filter tabs
- Subscription cards grid
- Empty state section
- Demo data controls

---

## Backend / State Handling

This project is intentionally designed as a stateless prototype.

Instead of using a traditional backend server, SubTrack handles temporary application data using React state. This allows the application to behave like a working subscription tracker during the current browser session.

Data is managed using:

```js
useState()
