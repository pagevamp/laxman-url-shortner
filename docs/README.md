# URL Shortener Project - Database Design (ER Diagram)

## 📘 Overview

This document describes the **Entity Relationship (ER) structure** for the URL Shortener project built with **PostgreSQL**.  
The database supports core functionalities such as:

- User authentication and email verification  
- URL shortening and management  
- Analytics tracking (hits, device info, etc.)  
- Notification system for user alerts (e.g., URL expiry)

---

## 🧩 Entities and Relationships

ER diagram link: `https://dbdiagram.io/d/68e70e16d2b621e422f4d115`

### 1. 🧑‍💻 users
Stores user information and authentication details.

| Column | Type | Description |
|---------|------|--------------|
| id | SERIAL (PK) | Unique user ID |
| username | VARCHAR | User’s chosen username |
| fullName | VARCHAR | User’s full name |
| email | VARCHAR(255) | User’s email address (unique) |
| password | Encrypted password |
| verifiedAt | BOOLEAN | Email verification status |
| createdAt | TIMESTAMP | Record creation date |
| updatedAt | TIMESTAMP | Record update date |
| deletedAt | TIMESTAMP | Record delete date |

**Relations:**
- One user → many `urls`
- One user → many `notifications`
- One user → many `email_verifications`

---

### 2. ✉️ email_verifications
Stores email verification tokens for user account confirmation.

| Column | Type | Description |
|---------|------|--------------|
| id | SERIAL (PK) | Unique record ID |
| userId | INT (FK) | Linked user |
| token | VARCHAR(100) | Unique email verification token |
| createdAt | TIMESTAMP | Token creation time |
| expiresAt | TIMESTAMP | Token expiration time |
| verifiedAt | TIMESTAMP | Time when the user verified their email |

**Relations:**
- Many tokens → belong to one user (`users.id < email_verifications.userId`)

---

### 3. 🔗 urls
Stores shortened URLs created by users.

| Column | Type | Description |
|---------|------|--------------|
| id | SERIAL (PK) | Unique URL ID |
| userId | INT (FK) | Linked user |
| original_url | TEXT | Original long URL |
| shortUrl | VARCHAR(20) | Shortened URL code |
| expiresAt | TIMESTAMP | Expiration date of the short URL |
| isActive | BOOLEAN | Whether the URL is active |
| createdAt | TIMESTAMP | Record creation date |
| updatedAt | TIMESTAMP | Record update date |
| deletedAt | TIMESTAMP | Record delete date |

**Relations:**
- One user → many URLs (`users.id < urls.userId`)
- One URL → many hits (`urls.id < hits.urlId`)

---

### 4. 📊 hits
Stores analytics for every time a short URL is accessed.

| Column | Type | Description |
|---------|------|--------------|
| id | SERIAL (PK) | Unique record ID |
| urlId | INT (FK) | Associated URL |
| redirectedAt | TIMESTAMP | Access time |
| ip | VARCHAR(100) | Visitor’s IP address |
| country | VARCHAR(10) | Parsed country code |
| userAgent | TEXT | Full user-agent string |

**Relations:**
- Many hits → belong to one URL (`urls.id < hits.urlId`)

---



## 🔗 Relationship Summary

| Relationship | Description |
|---------------|--------------|
| users → urls | A user can create multiple URLs |
| users → email_verifications | A user can have multiple email verification tokens |
| urls → hits | A shortened URL can be accessed multiple times |

---

## ⚙️ Design Notes

- **Email verification** is managed via the `email_verifications` table (supports multiple tokens and expiry handling).  
- **Rate limiting** and other logic (like URL redirection and expiry) are handled in application middleware.  
- **Analytics** from the `hits` table allow detailed reporting (browser, OS, device, referrer, etc.).

---

## 🧩 ER Diagram Tools

- **Editor:** [dbdiagram.io](https://dbdiagram.io)  
- **Database:** PostgreSQL  
- **ORM Compatibility:** TypeORM / Prisma  
- **Containerization:** Docker + Docker Compose

---

## 👨‍💻 Author

**Laxman Rumba**  
Version: `v1.2 (with Email Verification Table)`  
Database Design: October 2025
