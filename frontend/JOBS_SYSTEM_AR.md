# Jobs System - Frontend Documentation

## ✅ تم إنشاء نظام الوظائف الكامل

تم بناء Frontend كامل لنظام الوظائف (Jobs) مع كل الميزات التالية:

---

## 🎯 الميزات المتوفرة

### 1. عرض الوظائف (Job Listings)
- ✅ عرض قائمة الوظائف من الـ Backend
- ✅ Cursor-based Pagination (أداء أفضل)
- ✅ عرض معلومات الوظيفة كاملة:
  - اسم الوظيفة
  - اسم الشركة
  - الموقع
  - نوع الوظيفة (Full-time, Part-time, etc.)
  - المستوى الوظيفي (Senior, Junior, etc.)
  - الوصف
  - تاريخ النشر
  - لوجو الشركة

### 2. البحث والتصفية (Search & Filter)
- ✅ بحث بـ Job Title
- ✅ Clear Search
- ✅ Real-time search

### 3. Pagination
- ✅ Load More Button
- ✅ Cursor-based (يستخدم lastId)
- ✅ عرض عدد النتائج
- ✅ رسالة "reached end of list"

### 4. User Experience
- ✅ Loading States
- ✅ Error Handling
- ✅ Empty States
- ✅ Responsive Design
- ✅ Beautiful Card Design
- ✅ External Links لصفحة الوظيفة
- ✅ Company Website Link

---

## 📁 الملفات المُنشأة

### 1. Types & Interfaces
```
frontend/src/lib/jobs/types.ts
```
- `Job` interface
- `CursorPageResponse<T>` interface
- `JobsSearchParams` interface

### 2. API Service
```
frontend/src/lib/jobs/jobs-service.ts
```
Methods:
- `getAllJobs(lastId, size)` - جلب كل الوظائف
- `searchJobs({ title, lastId, size })` - بحث بالاسم
- `triggerSync(keyword)` - تشغيل الـ scraper

### 3. Components

#### Job Card
```
frontend/src/components/jobs/job-card.tsx
```
- عرض بطاقة وظيفة واحدة
- Beautiful design
- Icons من lucide-react
- External links

#### Search Filter
```
frontend/src/components/jobs/job-search-filter.tsx
```
- Search bar
- Clear button
- Loading state

#### Jobs List
```
frontend/src/components/jobs/jobs-list.tsx
```
- Main container
- State management
- Pagination logic
- Error handling
- Empty states

### 4. Page
```
frontend/src/app/jobs/page.tsx
```
- صفحة الوظائف الرئيسية

---

## 🌐 الروابط المتاحة

بعد تشغيل المشروع:

| الرابط | الوصف |
|--------|-------|
| `http://localhost:3000/jobs` | 📋 **صفحة الوظائف** - الصفحة الرئيسية |

---

## 🚀 كيفية الاستخدام

### 1. تشغيل المشروع

```bash
# Backend (Terminal 1)
cd backend
./mvnw spring-boot:run

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### 2. اذهب إلى صفحة الوظائف

```
http://localhost:3000/jobs
```

### 3. جرب الميزات

#### عرض الوظائف:
- الصفحة تحمل تلقائياً أول 10 وظائف
- اضغط "Load More Jobs" لتحميل المزيد

#### البحث:
- اكتب في Search bar (مثلاً: "React", "Backend", "Developer")
- اضغط "Search"
- النتائج تظهر مباشرة

#### التنقل:
- اضغط "View Job" للذهاب لصفحة الوظيفة الأصلية
- اضغط "Company Website" للذهاب لموقع الشركة

---

## 🔧 API Endpoints المستخدمة

### 1. Get All Jobs
```
GET http://localhost:8080/api/jobs?lastId={cursor}&size={pageSize}
```

Response:
```json
{
  "data": [...],
  "pageSize": 10,
  "nextCursor": 123,
  "hasNext": true
}
```

### 2. Search Jobs
```
GET http://localhost:8080/api/jobs/search?title={searchTerm}&lastId={cursor}&size={pageSize}
```

Response: نفس الـ structure

### 3. Trigger Scraper (Optional)
```
POST http://localhost:8080/api/jobs/sync?keyword={keyword}
```

---

## 🎨 Design Features

### Job Card Design:
- ✅ Company Logo
- ✅ Job Title (clickable)
- ✅ Company Name with icon
- ✅ Location with icon
- ✅ Time posted (relative)
- ✅ Employment Type badge
- ✅ Seniority Level badge
- ✅ Description preview (2 lines)
- ✅ Action buttons
- ✅ Hover effects

### Colors & Icons:
- 🔵 Blue primary color
- 🟣 Purple for seniority
- 📍 MapPin icon
- 🏢 Building icon
- 💼 Briefcase icon
- 🔗 External link icon
- ⏰ Clock icon

---

## 📊 State Management

```typescript
const [jobs, setJobs] = useState<Job[]>([]);           // القائمة
const [isLoading, setIsLoading] = useState(false);     // تحميل أولي
const [isLoadingMore, setIsLoadingMore] = useState(false); // تحميل المزيد
const [hasMore, setHasMore] = useState(false);         // هل يوجد المزيد
const [nextCursor, setNextCursor] = useState<number | null>(null); // Cursor
const [searchTitle, setSearchTitle] = useState("");    // Search term
const [error, setError] = useState<string | null>(null); // الأخطاء
```

---

## 🔍 مثال على الاستخدام

### بحث بسيط:
```typescript
await jobsService.searchJobs({ 
  title: "React Developer",
  size: 10 
});
```

### تحميل الصفحة التالية:
```typescript
await jobsService.searchJobs({ 
  title: "React Developer",
  lastId: 123,  // من nextCursor
  size: 10 
});
```

### تحميل كل الوظائف:
```typescript
await jobsService.getAllJobs();
```

---

## ✨ التحسينات المستقبلية (Optional)

### قريباً:
1. Filter بالـ Location
2. Filter بالـ Employment Type
3. Filter بالـ Seniority Level
4. Salary Range filter
5. Sort options (date, relevance)
6. Save/Bookmark jobs
7. Job details page
8. Apply for job functionality

### متقدم:
1. Infinite scroll بدلاً من Load More
2. Job recommendations
3. Email alerts for new jobs
4. Advanced search
5. Company profiles
6. Application tracking

---

## 🎉 الخلاصة

تم إنشاء نظام وظائف **كامل وجاهز للاستخدام** مع:

✅ **Beautiful UI** - تصميم احترافي
✅ **Full Pagination** - Cursor-based
✅ **Search** - بحث بالاسم
✅ **Responsive** - يعمل على جميع الأجهزات
✅ **Error Handling** - معالجة الأخطاء
✅ **Loading States** - حالات التحميل
✅ **TypeScript** - Type-safe
✅ **Clean Code** - كود نظيف ومنظم

---

## 🌐 الرابط النهائي

```
👉 http://localhost:3000/jobs
```

**استمتع بالنظام! 🚀**

---

*تم التطوير بواسطة: Mohamed Saad Abdalla & Ahmed Zaatary*
