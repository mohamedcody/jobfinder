# 🚀 كيفية تشغيل المشروع بعد إصلاح البروفايل

## 📌 المتطلبات

- **Node.js** ≥ 18
- **Java** ≥ 17 (للـ Backend)
- **PostgreSQL** ≥ 13 (أو أي Database مدعومة)
- **Git**

## 🔧 التثبيت

### 1️⃣ استنساخ المشروع

```bash
git clone https://github.com/mohamedcody/jobfinder.git
cd jobfinder
```

### 2️⃣ تثبيت Backend

```bash
cd backend
./mvnw clean install
# أو إذا كنت على Windows:
# mvnw.cmd clean install
```

### 3️⃣ تثبيت Frontend

```bash
cd frontend
npm install
```

## ⚙️ إعدادات البيئة

### Backend - `backend/src/main/resources/application.properties`

```properties
# Database
DB_URL=jdbc:postgresql://localhost:5432/jobfinder
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
MY_SECRET_KEY=your_secret_key_here
MY_EXPIRATION_TIME=86400000

# Gemini API
MY_APIFY_TOKEN=your_apify_token

# Email
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

### Frontend - `frontend/.env.local`

```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8080/api/auth
NEXT_PUBLIC_JOBS_API_URL=http://localhost:8080/api/jobs
NEXT_PUBLIC_PROFILE_API_URL=http://localhost:8080/api/users/profile
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

## 🎯 تشغيل المشروع

### الطريقة الأولى: استخدام run.sh (الأسهل)

```bash
cd /path/to/jobfinder
./run.sh
```

هذا سيقوم بـ:
- ✅ تشغيل Backend على `http://localhost:8080`
- ✅ تشغيل Frontend على `http://localhost:3000`
- ✅ إنشاء `.env.local` إذا لم يكن موجوداً

### الطريقة الثانية: تشغيل يدوي

#### تشغيل Backend

```bash
cd backend
./mvnw spring-boot:run
# سيعمل على: http://localhost:8080
```

#### تشغيل Frontend (في Terminal منفصل)

```bash
cd frontend
npm run dev
# سيعمل على: http://localhost:3000
```

## 📊 قاعدة البيانات

### إنشاء Database

```bash
# اتصل بـ PostgreSQL
psql -U postgres

# إنشاء database
CREATE DATABASE jobfinder;
```

### تهيئة الجداول

تطبيق Spring Boot سيقوم بإنشاء الجداول تلقائياً عند الـ startup.

### إدراج بيانات تجريبية (Optional)

```bash
cd backend/scripts
# استخدم seed_jobs.sql لإضافة بيانات تجريبية
psql -U postgres -d jobfinder -f seed_jobs.sql
```

## 🔐 عملية التسجيل وتعديل البروفايل

### 1. تسجيل حساب جديد

1. اذهب إلى `http://localhost:3000/register`
2. ملء النموذج وأنقر "Register"
3. تحقق من البريد الإلكتروني (في التطوير، يتم طباعة الرابط في الـ logs)

### 2. تسجيل الدخول

1. اذهب إلى `http://localhost:3000/login`
2. أدخل email و password
3. سيتم إعادة التوجيه إلى الصفحة الرئيسية

### 3. تعديل البروفايل

1. اذهب إلى `http://localhost:3000/profile`
2. أنقر على "Edit Profile"
3. عدّل البيانات التي تريدها:
   - الوظيفة الحالية
   - سنوات الخبرة
   - مستوى التعليم
   - الدولة والمدينة
   - الراتب المتوقع
   - السيرة الذاتية
4. أنقر "Save Changes"

## 🧪 اختبار الـ Profile API

### جيب البروفايل

```bash
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### حدّث البروفايل

```bash
curl -X PUT http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentJobTitle": "Senior Backend Engineer",
    "yearsOfExperience": 5,
    "educationLevel": "Bachelors",
    "country": "Egypt",
    "city": "Cairo",
    "expectedSalary": 120000,
    "currency": "EGP",
    "bio": "Passionate developer...",
    "isOpenToWork": true
  }'
```

## 📍 الـ Endpoints الرئيسية

### المصادقة
- `POST /api/auth/register` - تسجيل حساب جديد
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/logout` - تسجيل الخروج
- `POST /api/auth/refresh` - تحديث الـ Token

### البروفايل
- `GET /api/users/profile` - جيب البروفايل الخاص بي
- `PUT /api/users/profile` - حدّث البروفايل الخاص بي
- `GET /api/users/profile/{userId}` - جيب بروفايل مستخدم معين

### الوظائف
- `GET /api/jobs` - جيب جميع الوظائف
- `GET /api/jobs/filter` - ابحث عن وظائف (متقدم)
- `GET /api/jobs/search` - ابحث عن وظائف (بسيط)
- `POST /api/jobs/{id}/summarize` - احصل على ملخص AI للوظيفة

## 🐛 استكشاف الأخطاء

### Backend لا يبدأ

```bash
# تحقق من Java version
java -version

# تحقق من Database connection
# في application.properties تأكد من DB credentials صحيحة
```

### Frontend لا يبدأ

```bash
# أعد تثبيت Dependencies
rm -rf node_modules package-lock.json
npm install

# امسح الـ build cache
rm -rf .next
npm run build
```

### الـ Profile لا يحمل

```bash
# تحقق من JWT Token صحيح
# تحقق من Server Backend يعمل
# افتح Console (F12) وشوف الأخطاء
```

## 📚 المزيد من المعلومات

- 📖 [AGENTS.md](./AGENTS.md) - معلومات عن العمارة والـ Workflow
- 📖 [PROFILE_FIX_SUMMARY.md](./PROFILE_FIX_SUMMARY.md) - تفاصيل إصلاح البروفايل
- 📖 [JOBS_QUICK_START.md](./frontend/JOBS_QUICK_START.md) - بدء سريع للـ Jobs System

## 🎉 أنت جاهز!

بعد تشغيل المشروع:

1. ✅ اذهب إلى `http://localhost:3000`
2. ✅ سجّل حساب جديد
3. ✅ اذهب إلى `/profile`
4. ✅ عدّل البيانات الخاصة بك
5. ✅ استمتع! 🚀

---

**Happy Coding!** 💻✨

