# 🚀 دليل التشغيل السريع - JobFinder

## المشكلة الحالية ⚠️

**Node.js غير مثبت على النظام!**

---

## ✅ الحل: ثبّت Node.js أولاً

اختر طريقة من الطرق التالية:

### الطريقة 1️⃣: باستخدام apt (Ubuntu/Debian) - الأسهل

```bash
# ثبّت Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# تحقق من التثبيت
node --version
npm --version
```

### الطريقة 2️⃣: باستخدام nvm - الموصى بها

```bash
# ثبّت nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# أعد تحميل الـ shell
source ~/.bashrc

# ثبّت Node.js 20
nvm install 20
nvm use 20

# تحقق من التثبيت
node --version
npm --version
```

### الطريقة 3️⃣: تحميل يدوي

قم بتحميل Node.js من الموقع الرسمي:
https://nodejs.org/en/download/

---

## 🎯 بعد تثبيت Node.js، نفذ الخطوات التالية:

### الخطوة 1: انتقل لمجلد المشروع

```bash
cd /home/mohamed-saad/IdeaProjects/jobfinder
```

### الخطوة 2: شغّل الـ Backend (Spring Boot)

افتح Terminal جديد ونفذ:

```bash
cd backend
./mvnw spring-boot:run
```

⏳ انتظر حتى تظهر رسالة: **"Started JobFinderApplication"**

✅ Backend سيعمل على: **http://localhost:8080**

### الخطوة 3: شغّل الـ Frontend (Next.js)

افتح Terminal آخر (جديد) ونفذ:

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend سيعمل على: **http://localhost:3000**

---

## 🌐 افتح المتصفح واذهب إلى:

```
👉 http://localhost:3000
```

---

## 📱 الصفحات المتاحة في المشروع:

| الرابط | الوصف |
|--------|-------|
| `http://localhost:3000` | 🏠 الصفحة الرئيسية |
| `http://localhost:3000/login` | 🔐 تسجيل الدخول |
| `http://localhost:3000/register` | ✍️ إنشاء حساب جديد |
| `http://localhost:3000/forgot-password` | 🔑 نسيت كلمة المرور |
| `http://localhost:3000/reset-password` | 🔄 إعادة تعيين كلمة المرور |
| `http://localhost:3000/verify-email` | ✉️ تفعيل البريد الإلكتروني |

---

## 🧪 اختبار الميشروع:

### سناريو 1: تسجيل مستخدم جديد

1. اذهب إلى: http://localhost:3000/register
2. املأ البيانات:
   - **Username**: johndoe
   - **Email**: john@example.com
   - **Password**: MyPass123@
   - **Confirm Password**: MyPass123@
3. اضغط **Create Account**
4. سيتم توجيهك إلى صفحة Verify Email
5. افتح console الـ Backend لرؤية الـ OTP
6. أدخل الـ OTP وفعّل البريد
7. سجّل الدخول!

### سيناريو 2: تسجيل الدخول

1. اذهب إلى: http://localhost:3000/login
2. أدخل:
   - **Email or Username**: john@example.com
   - **Password**: MyPass123@
3. اضغط **Login**
4. سيتم حفظ الـ Token وتوجيهك للرئيسية

### سيناريو 3: نسيت كلمة المرور

1. اذهب إلى: http://localhost:3000/forgot-password
2. أدخل البريد الإلكتروني
3. اضغط **Send reset OTP**
4. شوف الـ OTP في console الـ Backend
5. اذهب لصفحة Reset Password
6. أدخل: Email + OTP + كلمة مرور جديدة
7. اضغط **Reset password**

---

## 🛠️ أوامر مفيدة:

### إيقاف المشروع

اضغط `Ctrl + C` في كل Terminal

### مشاهدة الـ Logs

```bash
# Backend logs
tail -f backend/logs/application.log

# Frontend logs (في Terminal الذي يعمل فيه)
```

### حذف الـ Build وإعادة البناء

```bash
# Frontend
cd frontend
rm -rf .next node_modules
npm install
npm run dev

# Backend
cd backend
./mvnw clean package
./mvnw spring-boot:run
```

---

## ❓ مشاكل شائعة وحلولها:

### المشكلة: Backend لا يعمل

**الحل:**

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

### المشكلة: Frontend يعطي خطأ "Module not found"

**الحل:**

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### المشكلة: Port 3000 أو 8080 مستخدم

**الحل:**

```bash
# إيقاف العملية على Port 3000
lsof -ti:3000 | xargs kill -9

# إيقاف العملية على Port 8080
lsof -ti:8080 | xargs kill -9
```

### المشكلة: Cannot connect to backend

**الحل:**

1. تأكد أن Backend يعمل على http://localhost:8080
2. تحقق من `.env.local` في مجلد frontend:
   ```
   NEXT_PUBLIC_AUTH_API_URL=http://localhost:8080/api/auth
   ```
3. أعد تشغيل Frontend

---

## 📚 ملفات التوثيق الإضافية:

- **`frontend/STATUS.md`** - تقرير كامل عن حالة المشروع
- **`frontend/FIXES_SUMMARY_AR.md`** - ملخص الإصلاحات بالعربية
- **`frontend/QUICK_START.md`** - دليل سريع (English)
- **`frontend/AUTH_COMPONENTS_GUIDE.md`** - دليل المكونات الكامل

---

## 🎉 النتيجة النهائية:

بعد تنفيذ الخطوات:

✅ Backend يعمل على http://localhost:8080
✅ Frontend يعمل على http://localhost:3000
✅ كل الـ Authentication Forms شغالة
✅ التوثيق كامل
✅ المشروع جاهز للاستخدام!

---

## 💡 ملاحظات مهمة:

1. **Backend لازم يشتغل الأول** قبل Frontend
2. **الـ OTP** بيظهر في console الـ Backend (مش بيتبعت على Email حقيقي)
3. **الـ Token** بيتحفظ في localStorage
4. **لو سجلت الدخول وقفلت المتصفح**، الـ session بتفضل موجودة

---

**تم التطوير بـ ♥ بواسطة:**
- Mohamed Saad Abdalla
- Ahmed Zaatary

---

**آخر تحديث:** 8 أبريل 2026
