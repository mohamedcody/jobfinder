# 🔧 إصلاح مشاكل Backend

## المشكلة الحالية

Backend لا يعمل بسبب مشاكل في إعدادات Database!

---

## ✅ الحل السريع

### الخطوة 1: تعديل application.properties

افتح الملف:
```
backend/src/main/resources/application.properties
```

وعدّل السطور التالية حسب إعدادات PostgreSQL عندك:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/jobfinder
spring.datasource.username=postgres
spring.datasource.password=YOUR_POSTGRES_PASSWORD_HERE
```

### الخطوة 2: إنشاء Database

افتح PostgreSQL وأنشئ database:

```bash
psql -U postgres
```

ثم نفذ:
```sql
CREATE DATABASE jobfinder;
\q
```

### الخطوة 3: تشغيل Backend

```bash
cd backend
./mvnw spring-boot:run
```

---

## 🔒 أو استخدم H2 Database (للتجربة السريعة)

إذا لم يكن لديك PostgreSQL:

### 1. عدّل `pom.xml`

أضف dependency:
```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

### 2. عدّل `application.properties`

```properties
# H2 Database Configuration
spring.datasource.url=jdbc:h2:mem:jobfinder
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true
```

### 3. شغّل Backend

```bash
cd backend
./mvnw spring-boot:run
```

---

## 📝 التأكد من نجاح التشغيل

بعد تشغيل Backend، افتح:

```
http://localhost:8080
```

إذا رأيت صفحة، معناه Backend يعمل! ✅

---

## 🌐 بعد تشغيل Backend بنجاح:

1. شغّل Frontend:
```bash
cd frontend
npm run dev
```

2. افتح المتصفح:
```
http://localhost:3000/login
```

3. سجّل دخول واستمتع!

---

**ملحوظة:** المشكلة الأساسية هي **password authentication** للـ PostgreSQL.

أسهل حل هو تعديل الـ `application.properties` بـ username و password الصحيحين!
