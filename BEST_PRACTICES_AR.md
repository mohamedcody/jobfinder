# 🎯 أفضل الممارسات البرمجية - JobFinder

## 1️⃣ TypeScript Best Practices

### ✅ استخدم الأنواع الصحيحة
```typescript
// ❌ تجنب
const data: any = response;

// ✅ استخدم
interface UserData {
  id: number;
  name: string;
  email: string;
}
const data: UserData = response;
```

### ✅ استخدم Interfaces بدل Types للـ Objects
```typescript
// ✅ للـ objects
interface User {
  id: number;
  name: string;
}

// ✅ للـ unions
type Status = "active" | "inactive" | "pending";
```

---

## 2️⃣ React Hooks Best Practices

### ✅ استخدم Dependencies Array بشكل صحيح
```typescript
// ❌ خطر - infinite loop
useEffect(() => {
  fetchData();
}); // no dependencies

// ✅ صحيح
useEffect(() => {
  fetchData();
}, []); // runs once

// ✅ صحيح - with dependencies
useEffect(() => {
  fetchData(id);
}, [id]);
```

### ✅ استخدم useMemo لـ expensive operations
```typescript
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

---

## 3️⃣ Error Handling

### ✅ استخدم Try-Catch بشكل صحيح
```typescript
try {
  const result = await api.fetch();
  return result;
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error("API Error:", error.response?.status);
  } else {
    console.error("Unexpected Error:", error);
  }
  throw error; // re-throw للـ caller
}
```

---

## 4️⃣ API Integration

### ✅ إعادة المحاولة (Retry Logic)
```typescript
async function retryFetch(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * (i + 1)); // exponential backoff
    }
  }
}
```

### ✅ Request Deduplication
```typescript
// منع تكرار الـ API calls
const pendingRequests = new Map();

async function fetchWithCache(key, fn) {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  const promise = fn();
  pendingRequests.set(key, promise);
  
  try {
    return await promise;
  } finally {
    pendingRequests.delete(key);
  }
}
```

---

## 5️⃣ Component Design

### ✅ Composition over Inheritance
```typescript
// ❌ تجنب
class ExtendedButton extends Button {}

// ✅ استخدم composition
function CustomButton({ children, ...props }) {
  return <Button {...props}>{children}</Button>;
}
```

### ✅ Props Validation
```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

function Button({ variant = "primary", size = "md", disabled = false }: ButtonProps) {
  // ...
}
```

---

## 6️⃣ Performance Optimization

### ✅ Code Splitting
```typescript
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <LoadingSpinner />
});
```

### ✅ Image Optimization
```typescript
import Image from "next/image";

<Image
  src="/image.png"
  alt="description"
  width={800}
  height={600}
  priority // for above-the-fold
/>
```

---

## 7️⃣ Security Best Practices

### ✅ Input Sanitization
```typescript
import { escapeHtml } from "@/lib/security/sanitization";

// تنظيف المدخلات من XSS
const safeHtml = escapeHtml(userInput);
```

### ✅ Environment Variables
```typescript
// ✅ استخدم NEXT_PUBLIC_ للـ client-side
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// لا تكشف sensitive data في الـ client
// استخدم server-side فقط
```

---

## 8️⃣ Testing Best Practices

### ✅ اختبر الـ Edge Cases
```typescript
describe("calculateTotal", () => {
  it("should handle empty array", () => {
    expect(calculateTotal([])).toBe(0);
  });
  
  it("should handle negative numbers", () => {
    expect(calculateTotal([1, -2, 3])).toBe(2);
  });
});
```

---

## 9️⃣ Code Organization

### ✅ Structure Folders بشكل منطقي
```
src/
├── components/    # UI components
├── hooks/        # Custom hooks
├── lib/          # Utilities
│   ├── api/      # API client
│   ├── auth/     # Authentication
│   └── utils/    # Helpers
├── app/          # Pages
└── types/        # TypeScript types
```

---

## 🔟 Naming Conventions

### ✅ استخدم أسماء واضحة
```typescript
// ❌ غير واضح
const u = getCurrentUser();
const h = user.avatar;

// ✅ واضح
const user = getCurrentUser();
const userAvatar = user.avatar;
```

### ✅ Prefixes للـ Booleans
```typescript
const isLoading = true;
const hasError = false;
const shouldShow = true;
```

---

## 1️⃣1️⃣ Documentation

### ✅ اكتب JSDoc للدوال المهمة
```typescript
/**
 * جلب بيانات المستخدم من الـ API
 * @param userId - معرف المستخدم
 * @returns بيانات المستخدم أو null إذا لم يتم العثور عليه
 * @throws AxiosError إذا فشلت الـ request
 */
export async function fetchUser(userId: number): Promise<User | null> {
  // ...
}
```

---

## 1️⃣2️⃣ Version Control

### ✅ Commit Messages
```
✅ بدل "fix"
🎉 بدل "add"
🐛 بدل "bug"
📝 بدل "docs"

مثال:
✅ Fix: username validation error
🎉 Add: career intelligence hub
🐛 Fix: flickering AI insights
📝 Docs: update API documentation
```

---

## 1️⃣3️⃣ Performance Monitoring

### ✅ استخدم Lighthouse
```bash
npm install -g lighthouse
lighthouse https://yoursite.com --view
```

### ✅ Web Vitals
- **LCP** (Largest Contentful Paint) < 2.5s
- **FID** (First Input Delay) < 100ms
- **CLS** (Cumulative Layout Shift) < 0.1

---

## 1️⃣4️⃣ Accessibility (A11y)

### ✅ استخدم ARIA labels
```typescript
<button aria-label="Close menu">✕</button>
```

### ✅ Keyboard Navigation
```typescript
<input
  onKeyDown={(e) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") handleClose();
  }}
/>
```

---

## 1️⃣5️⃣ Git Best Practices

### ✅ Branch Naming
```
feature/add-job-search
bugfix/fix-profile-validation
docs/update-readme
```

### ✅ Commit Early and Often
- Commits صغيرة وواضحة أفضل من commits كبيرة

---

## 📋 Checklist قبل Deployment

- [ ] جميع الأخطاء تم حلها
- [ ] اختبرت جميع الميزات
- [ ] تحققت من الأداء (Lighthouse)
- [ ] اختبرت على mobile
- [ ] الأمان جيد
- [ ] Documentation محدثة
- [ ] Environment variables صحيحة
- [ ] Build يعمل بدون مشاكل

---

## 🎓 الدروس المستفادة

1. اكتب الأنواع أولاً
2. اختبر edge cases
3. وثّق الكود المعقد
4. لا تعيد اختراع العجلة
5. استخدم libraries موثوقة
6. قرأ الـ error messages بعناية
7. استفسر قبل ما تفترض
8. احتفظ بالكود نظيف
9. راجع الـ code شخص آخر
10. تعلم من الأخطاء

---

**آخر تحديث:** 13 مايو 2026

