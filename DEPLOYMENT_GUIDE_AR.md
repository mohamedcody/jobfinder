# 🚀 دليل النشر - JobFinder

## 📋 Pre-Deployment Checklist

- [ ] جميع الـ tests تعمل
- [ ] Build بدون أخطاء
- [ ] Environment variables صحيحة
- [ ] Database backup موجود
- [ ] Documentation محدثة
- [ ] Performance tests تمام
- [ ] Security scan تمام

---

## 🔧 خطوات النشر

### 1. البناء المحلي

**Frontend:**
```bash
cd frontend
npm run build
npm run start
# اختبر على http://localhost:3000
```

**Backend:**
```bash
cd backend
mvn clean package
java -jar target/job-finder-*.jar
# اختبر على http://localhost:8080
```

### 2. دفع إلى Repository

```bash
git add .
git commit -m "🚀 Release: v1.0.0"
git push origin main
```

### 3. نشر الـ Frontend (Vercel)

```bash
# Option 1: من خلال GitHub
# - ربط repository مع Vercel
# - Vercel تنشر تلقائياً عند كل push

# Option 2: استخدام Vercel CLI
npm i -g vercel
vercel deploy --prod
```

### 4. نشر الـ Backend

**على Server:**
```bash
# تسجيل الدخول
ssh user@server.com

# التحديث
cd /app/jobfinder
git pull origin main
mvn clean package

# إيقاف الخدمة القديمة
sudo systemctl stop jobfinder

# نسخ الـ JAR الجديد
sudo cp target/job-finder-*.jar /opt/jobfinder/

# بدء الخدمة الجديدة
sudo systemctl start jobfinder

# تحقق من الحالة
sudo systemctl status jobfinder
```

---

## 🗄️ Database Migration

```bash
# إنشء نسخة احتياطية
pg_dump jobfinder > backup_$(date +%Y%m%d).sql

# تطبيق التحديثات
# Spring Boot سيطبق الـ migrations تلقائياً
```

---

## 📊 Monitoring

### Frontend Monitoring
```bash
# Check Lighthouse scores
lighthouse https://jobfinder.com --view

# Check uptime
curl -I https://jobfinder.com
```

### Backend Monitoring
```bash
# تحقق من الـ logs
tail -f /var/log/jobfinder/app.log

# تحقق من الـ health
curl http://localhost:8080/actuator/health

# تحقق من الأداء
curl http://localhost:8080/actuator/metrics
```

---

## 🔐 Security Checklist

- [ ] SSL/HTTPS مفعل
- [ ] CORS محدد صحيح
- [ ] JWT tokens آمن
- [ ] Passwords مشفرة
- [ ] Sensitive data محمي
- [ ] Database backup محمي
- [ ] Firewall مفعل

---

## 🆘 Rollback

إذا حدثت مشكلة:

```bash
# Revert latest commit
git revert HEAD

# أو
git reset --hard HEAD~1

# أو استعيد من backup
pg_restore jobfinder < backup_20260513.sql
```

---

**آخر تحديث:** 13 مايو 2026

