# 🚀 Jobs System - Quick Start

## الرابط المباشر

بعد تشغيل المشروع، اذهب إلى:

```
👉 http://localhost:3000/jobs
```

---

## الملفات المُنشأة

### Types & Services
- ✅ `src/lib/jobs/types.ts` - TypeScript interfaces
- ✅ `src/lib/jobs/jobs-service.ts` - API service

### Components
- ✅ `src/components/jobs/job-card.tsx` - بطاقة الوظيفة
- ✅ `src/components/jobs/job-search-filter.tsx` - شريط البحث
- ✅ `src/components/jobs/jobs-list.tsx` - قائمة الوظائف الرئيسية

### Page
- ✅ `src/app/jobs/page.tsx` - صفحة Jobs

---

## الميزات ✨

- ✅ عرض الوظائف مع Pagination
- ✅ بحث بـ Job Title
- ✅ Load More functionality
- ✅ Beautiful card design
- ✅ Responsive
- ✅ Error handling
- ✅ Loading states
- ✅ Empty states

---

## كيف تستخدم؟

### 1. شغّل Backend
```bash
cd backend
./mvnw spring-boot:run
```

### 2. شغّل Frontend
```bash
cd frontend
npm run dev
```

### 3. افتح المتصفح
```
http://localhost:3000/jobs
```

### 4. جرب:
- شوف الوظائف
- ابحث بكلمة (مثلاً "React")
- اضغط Load More
- اضغط View Job

---

## API Endpoints

```
GET  /api/jobs                  - Get all jobs
GET  /api/jobs/search?title=X   - Search jobs
POST /api/jobs/sync?keyword=X   - Trigger scraper
```

---

## Environment Variables

تأكد من `.env.local`:

```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8080/api/auth
NEXT_PUBLIC_JOBS_API_URL=http://localhost:8080/api/jobs
```

---

## 🎉 كل شيء جاهز!

اذهب الآن إلى: **http://localhost:3000/jobs**

