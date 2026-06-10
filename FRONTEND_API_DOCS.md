# 🚀 JobFinder Platform - API Documentation

This document provides a comprehensive guide for the Frontend Developer to integrate with the Backend APIs.

## 🔗 Base URL
`http://localhost:8080/api`

## 🛡️ Authentication
All protected endpoints require a Bearer token.
**Header Format:** `Authorization: Bearer <your_jwt_token>`

---

## 1. Jobs API (وظائف البحث والفلترة)

### 📌 Filter & Search Jobs (Pagination Supported)
يستخدم للبحث والفلترة الدقيقة للوظائف باستخدام الـ Cursor Pagination (أفضل في الأداء).
- **URL**: `/jobs/filter`
- **Method**: `GET`
- **Auth Required**: Yes

**Query Parameters (All Optional):**
| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `title` | String | engineer | Search by job title |
| `location` | String | cairo | Search by location |
| `minSalary` | String | 5000 | Minimum expected salary |
| `postedAfter` | Date (ISO) | 2025-01-01 | Jobs posted after a certain date |
| `employmentType`| String | FULL_TIME | Full-time, part-time, etc. |
| `lastId` | Long | 50 | ID of the last item in the previous page (for pagination) |
| `size` | Integer| 10 | Number of items per page |

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": 51,
      "title": "Software Engineer",
      "location": "Cairo",
      "employmentType": "FULL_TIME",
      "company": {
        "name": "Tech Corp",
        "logoUrl": "..."
      }
    }
  ],
  "nextCursor": 60,
  "hasMore": true
}
```

---

### 📌 Summarize Job using AI (ملخص الذكاء الاصطناعي)
يطلب من الذكاء الاصطناعي قراءة الوظيفة وعمل ملخص لها.
- **URL**: `/jobs/{id}/summarize`
- **Method**: `POST`
- **Auth Required**: Yes

**Path Variables:**
- `id`: Job ID

**Success Response (200 OK):**
```json
{
  "summary": "This is a brief AI generated summary for the job highlighting key skills and requirements..."
}
```

---

## 2. Autonomous Scraper API (محرك سحب البيانات)

### 📌 Trigger Scraper Manually (تشغيل سحب البيانات يدوياً)
يقوم بتشغيل سكريبت Apify لجلب وظائف معينة من لينكد إن فوراً بناءً على كلمة مفتاحية.
- **URL**: `/scraper/trigger`
- **Method**: `POST`
- **Auth Required**: Yes (Admin Preferred)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keyword` | String | Yes | Job keyword to scrape (e.g., "Java Developer") |

**Success Response (200 OK):**
Returns a plain text confirmation message (e.g., `"Successfully saved 15 jobs."`)

---

## 💡 Notes for Frontend
- If you receive a `401 Unauthorized`, please clear the local storage and redirect the user to `/login`.
- For pagination on `/jobs/filter`, use the `nextCursor` value from the response and pass it as `lastId` in the next request to load more items.
