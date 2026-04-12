# 🚀 JobFinder - Authentication System

مشروع كامل لنظام توثيق (Authentication) باستخدام Spring Boot + Next.js + TypeScript

---

## 📋 المتطلبات الأساسية

قبل تشغيل المشروع، تأكد من تثبيت:

- ✅ **Java 17+** (للـ Backend)
- ✅ **Node.js 18+** (للـ Frontend)
- ✅ **npm** (يأتي مع Node.js)

---

## ⚡ تشغيل سريع (Quick Start)

### الطريقة الأسهل - استخدم السكريبت الجاهز:

```bash
cd /home/mohamed-saad/IdeaProjects/jobfinder
./run.sh
```

السكريبت سيقوم بـ:
1. ✅ التحقق من Node.js
2. ✅ تشغيل Backend
3. ✅ تشغيل Frontend
4. ✅ فتح المشروع على http://localhost:3000

---

## 🛠️ التشغيل اليدوي (Manual Setup)

### 1️⃣ Backend (Spring Boot)

افتح Terminal جديد:

```bash
cd backend
./mvnw spring-boot:run
```

Backend سيعمل على: **http://localhost:8080**

### 2️⃣ Frontend (Next.js)

افتح Terminal آخر:

```bash
cd frontend
npm install          # في المرة الأولى فقط
npm run dev
```

Frontend سيعمل على: **http://localhost:3000**

---

## 🌐 الوصول للمشروع

افتح المتصفح واذهب إلى:

```
👉 http://localhost:3000
```

---

## 📱 الصفحات المتاحة

| URL | الوصف |
|-----|-------|
| `/` | الصفحة الرئيسية |
| `/login` | تسجيل الدخول |
| `/register` | إنشاء حساب جديد |
| `/forgot-password` | نسيت كلمة المرور |
| `/reset-password` | إعادة تعيين كلمة المرور |
| `/verify-email` | تفعيل البريد الإلكتروني |

---

## 🏗️ بنية المشروع

```
jobfinder/
├── backend/                 # Spring Boot API
│   ├── src/
│   │   └── main/
│   │       ├── java/        # Java source code
│   │       └── resources/   # application.properties
│   └── pom.xml
│
├── frontend/                # Next.js App
│   ├── src/
│   │   ├── app/            # Pages (App Router)
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Validation schemas
│   │   └── lib/            # Services & utilities
│   ├── package.json
│   └── .env.local          # Environment variables
│
├── run.sh                  # سكريبت التشغيل السريع
└── START_HERE_AR.md        # دليل التشغيل بالعربية
```

---

## 🔧 التقنيات المستخدمة

### Backend:
- ☕ **Java 17**
- 🍃 **Spring Boot 3**
- 🔐 **Spring Security + JWT**
- 💾 **JPA/Hibernate**
- 📧 **Email Service (OTP)**
- ✅ **Bean Validation**

### Frontend:
- ⚛️ **React 19**
- ▲ **Next.js 16** (App Router)
- 📘 **TypeScript**
- 🎨 **Tailwind CSS v4**
- 📝 **React Hook Form + Zod**
- 🌐 **Axios**
- 🔔 **Sonner (Toasts)**

---

## 📚 التوثيق

### للمطورين:

- 📖 **`START_HERE_AR.md`** - دليل التشغيل الكامل بالعربية
- 📖 **`frontend/STATUS.md`** - تقرير حالة المشروع
- 📖 **`frontend/FIXES_SUMMARY_AR.md`** - ملخص الإصلاحات
- 📖 **`frontend/QUICK_START.md`** - دليل سريع (English)
- 📖 **`frontend/AUTH_COMPONENTS_GUIDE.md`** - دليل المكونات الكامل

---

## 🧪 اختبار المشروع

### سيناريو التسجيل الكامل:

1. **التسجيل** → http://localhost:3000/register
   - Username: `johndoe`
   - Email: `john@example.com`
   - Password: `MyPass123@`

2. **تفعيل البريد** → http://localhost:3000/verify-email
   - شوف الـ OTP في Backend logs
   - أدخل OTP وفعّل

3. **تسجيل الدخول** → http://localhost:3000/login
   - استخدم Email/Username + Password
   - سيتم حفظ Token

4. **اختبر Forgot Password** → http://localhost:3000/forgot-password
   - أدخل Email
   - احصل على OTP
   - غيّر كلمة المرور

---

## ⚙️ Environment Variables

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8080/api/auth
```

### Backend (`application.properties`)

```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/jobfinder
spring.datasource.username=root
spring.datasource.password=yourpassword

# JWT
jwt.secret=your-secret-key
jwt.expiration=86400000

# Email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

---

## 🐛 حل المشاكل الشائعة

### Backend لا يعمل

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

### Frontend لا يعمل

```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Port مستخدم

```bash
# إيقاف Backend (port 8080)
lsof -ti:8080 | xargs kill -9

# إيقاف Frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

### Node.js غير مثبت

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# أو استخدم nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
```

---

## ✨ الميزات

- ✅ تسجيل مستخدم جديد مع validation كامل
- ✅ تسجيل دخول بـ Email أو Username
- ✅ نسيت كلمة المرور مع OTP
- ✅ إعادة تعيين كلمة المرور
- ✅ تفعيل البريد الإلكتروني بـ OTP
- ✅ JWT Token Management
- ✅ Form Validation (Zod)
- ✅ Error Handling
- ✅ Loading States
- ✅ Toast Notifications
- ✅ Responsive Design
- ✅ TypeScript في كل مكان
- ✅ Clean Code Architecture

---

## 👥 الفريق

**تم التطوير بـ ♥ بواسطة:**
- Mohamed Saad Abdalla
- Ahmed Zaatary

---

## 📞 الدعم

للأسئلة أو المشاكل:
- راجع ملفات التوثيق في `/frontend/*.md`
- افحص Browser Console
- تأكد من تشغيل Backend
- راجع الـ Logs

---

## 📜 License

ISC License

---

## 🎯 الحالة الحالية

✅ **المشروع جاهز 100% للاستخدام!**

- ✅ Backend يعمل بشكل كامل
- ✅ Frontend يعمل بشكل كامل
- ✅ جميع Forms تعمل
- ✅ Validation يعمل
- ✅ Authentication Flow كامل
- ✅ التوثيق كامل
- ✅ لا توجد أخطاء

**جاهز للإنتاج! 🚀**

---

*آخر تحديث: 8 أبريل 2026*
