# 📚 دليل التطوير الشامل - JobFinder

## 🚀 البدء السريع

### 1. التثبيت الأولي

```bash
# استنساخ المشروع
git clone <repository-url>
cd jobfinder

# تثبيت dependencies الـ Frontend
cd frontend
npm install

# تثبيت dependencies الـ Backend
cd ../backend
mvn clean install
```

### 2. إعداد البيئة

**Frontend** - أنشئ `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=JobFinder PRO
```

**Backend** - أنشئ `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/jobfinder
spring.datasource.username=postgres
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
```

### 3. تشغيل المشروع

**Frontend:**
```bash
cd frontend
npm run dev
# يفتح على http://localhost:3000
```

**Backend:**
```bash
cd backend
mvn spring-boot:run
# يعمل على http://localhost:8080
```

---

## 📁 هيكل المشروع

```
jobfinder/
├── frontend/
│   ├── src/
│   │   ├── app/              # صفحات Next.js
│   │   ├── components/       # مكونات React
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities و APIs
│   │   └── styles/           # CSS globals
│   ├── public/               # Assets ثابتة
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── main/java/
│   │   │   └── jobfinder/
│   │   │       ├── controller/    # API endpoints
│   │   │       ├── service/       # Business logic
│   │   │       ├── repository/    # Database
│   │   │       ├── entity/        # Models
│   │   │       └── exception/     # Error handling
│   │   └── resources/
│   │       └── application.properties
│   └── pom.xml
│
└── docs/
    ├── API_DOCUMENTATION.md
    ├── ARCHITECTURE.md
    └── DEPLOYMENT.md
```

---

## 🔧 المهام الشائعة

### إضافة صفحة جديدة

1. **أنشئ مجلد الصفحة:**
```bash
mkdir -p src/app/new-page
touch src/app/new-page/page.tsx
```

2. **اكتب الكود:**
```typescript
"use client";

import { AppLayout } from "@/components/layout/app-layout";

export default function NewPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <h1 className="text-4xl font-black text-white">صفحة جديدة</h1>
        {/* محتوى الصفحة */}
      </div>
    </AppLayout>
  );
}
```

### إضافة مكون جديد

1. **أنشئ المجلد:**
```bash
touch src/components/MyComponent.tsx
```

2. **اكتب المكون:**
```typescript
"use client";

interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}

export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div className="rounded-2xl border border-white/10 p-6">
      <h2 className="text-lg font-bold text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}
```

### إضافة API Endpoint

**Backend - Controller:**
```java
@RestController
@RequestMapping("/api/items")
public class ItemController {
  
  @GetMapping
  public ResponseEntity<List<Item>> getItems() {
    return ResponseEntity.ok(itemService.getAllItems());
  }
  
  @PostMapping
  public ResponseEntity<Item> createItem(@RequestBody Item item) {
    return ResponseEntity.ok(itemService.create(item));
  }
}
```

**Frontend - Hook:**
```typescript
export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/items");
      setItems(response.data);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { items, isLoading, fetchItems };
}
```

---

## 🧪 الاختبار

### Frontend Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Backend Testing
```bash
# Run tests
mvn test

# With coverage
mvn test jacoco:report
```

---

## 📊 Debugging

### Frontend
1. **استخدم DevTools:**
   - F12 لفتح DevTools
   - Console tab للـ logs
   - Network tab لـ API calls

2. **استخدم React DevTools:**
   - ثبت extension من Chrome
   - اضغط على Components tab

3. **استخدم Console:**
```typescript
console.log("Debug:", { variable, status });
console.table(arrayOfObjects);
console.time("operation");
// ... code
console.timeEnd("operation");
```

### Backend
1. **استخدم Logging:**
```java
logger.info("Fetching user: {}", userId);
logger.error("Error occurred", exception);
```

2. **استخدم Debugger:**
   - ضع breakpoints
   - اضغط F5 للـ debug mode
   - استخدم Step Over/Into

---

## 🚢 Deployment

### Frontend Deployment (Vercel)
```bash
# Push to GitHub
git push origin main

# Vercel automatically deploys
# أو استخدم CLI
vercel deploy
```

### Backend Deployment
```bash
# Build JAR
mvn clean package

# Deploy to server
scp target/job-finder-*.jar user@server:/app/
ssh user@server "java -jar /app/job-finder-*.jar"
```

---

## 📝 نصائح مهمة

### 1. استخدم Git بشكل صحيح
```bash
# أنشئ branch جديد
git checkout -b feature/new-feature

# اعمل commits صغيرة
git commit -m "✅ Fix: validation error"

# أرسل للـ remote
git push origin feature/new-feature

# أنشئ Pull Request
# (في GitHub)
```

### 2. اختبر قبل البناء
```bash
# Frontend
npm run lint
npm run build

# Backend
mvn clean verify
```

### 3. اكتب تعليقات واضحة
```typescript
// ❌ سيء
const x = y + 10; // add 10

// ✅ جيد
// حساب الحد الأقصى للراتب مع bonus
const maxSalary = baseSalary + performanceBonus;
```

### 4. استخدم Type Safety
```typescript
// ❌ تجنب
const response: any = await api.fetch();

// ✅ استخدم
interface ApiResponse {
  data: User[];
  status: number;
}
const response: ApiResponse = await api.fetch();
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة: "Module not found"
**الحل:**
```bash
# نظف node_modules
rm -rf node_modules package-lock.json
npm install

# أو في Java
mvn clean install
```

### المشكلة: Port already in use
**الحل:**
```bash
# قتل الـ process
lsof -i :3000  # Frontend
kill -9 <PID>

lsof -i :8080  # Backend
kill -9 <PID>
```

### المشكلة: CORS error
**الحل (Backend):**
```java
@Configuration
public class CorsConfig {
  @Bean
  public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
          .allowedOrigins("http://localhost:3000")
          .allowedMethods("*");
      }
    };
  }
}
```

---

## 📚 موارد مفيدة

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **Spring Boot Docs:** https://spring.io/projects/spring-boot
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## 🤝 Contributing

1. Fork المشروع
2. أنشئ feature branch
3. اعمل commits واضحة
4. اكتب اختبارات
5. أرسل Pull Request

---

**آخر تحديث:** 13 مايو 2026

