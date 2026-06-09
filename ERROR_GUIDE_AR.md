# 🔍 دليل شامل لأنواع الأخطاء الشائعة والحلول

## 📌 القسم الأول: أخطاء TypeScript

### 1. Type Mismatch
**المشكلة:**
```typescript
// ❌ خطأ
Type 'UpdateUserProfileRequest' is not assignable...
```

**السبب:**
- اسم الـ interface غير صحيح
- عدم توافق الأنواع بين الـ export والـ import

**الحل:**
```typescript
// ✅ صحيح
import { UpdateProfileRequest } from "./types";

// في الدالة:
async function updateProfile(data: UpdateProfileRequest) {
  // ...
}
```

---

### 2. Missing Exports
**المشكلة:**
```
export const metadata, but themeColor not allowed
```

**الحل (Next.js 16+):**
```typescript
// ❌ قديم
export const metadata: Metadata = {
  title: "App",
  themeColor: "#000"
};

// ✅ جديد
export const metadata: Metadata = {
  title: "App"
};

export const viewport: Viewport = {
  themeColor: "#000"
};
```

---

## 🎨 القسم الثاني: أخطاء React و UI

### 1. Prop Type Errors
**المشكلة:**
```typescript
// ❌ خطأ
<Icon title="text" /> // Lucide icons don't support title
```

**الحل:**
```typescript
// ✅ صحيح
<div title="text">
  <Icon />
</div>
```

---

### 2. Flickering/Layout Shift
**المشكلة:**
```typescript
// ❌ يسبب flickering
className="line-clamp-3 hover:line-clamp-none"
```

**السبب:**
- عند الـ hover، الكلاس يتغير، مما يسبب إعادة تصيير (re-render)

**الحل:**
```typescript
// ✅ ثابت ومستقر
className="max-h-[120px] overflow-y-auto"
```

---

## 🔌 القسم الثالث: أخطاء الـ API

### 1. 401 Unauthorized
**السبب:** Token منتهي الصلاحية أو غير صحيح

**الحل:**
```typescript
if (error.response?.status === 401) {
  // حذف الـ token والرجوع للـ login
  localStorage.removeItem("token");
  window.location.href = "/login";
}
```

---

### 2. 500 Internal Server Error
**السبب:** خطأ في الـ Backend

**الحل:**
```typescript
if (error.response?.status === 500) {
  console.error("Backend error:", error);
  // أرسل تقرير للـ backend
}
```

---

## 📦 القسم الرابع: أخطاء البناء

### 1. Build Fails - Type Check Errors
**الحل:**
```bash
# تنظيف وإعادة البناء
npm run clean
npm run build

# أو
rm -rf .next
npm run build
```

---

### 2. ESLint Errors
**الحل:**
```bash
# إصلاح تلقائي
npm run lint -- --fix

# أو يدويًا
npm run lint
```

---

## 🗂️ القسم الخامس: أخطاء البيانات

### 1. Null/Undefined Values
**المشكلة:**
```typescript
// ❌ خطأ - قد يكون null
console.log(user.profile.name)
```

**الحل:**
```typescript
// ✅ آمن
console.log(user?.profile?.name ?? "N/A")

// أو باستخدام Optional Chaining
console.log(user?.profile?.name)
```

---

### 2. Array Index Out of Bounds
**الحل:**
```typescript
// ✅ آمن
if (items.length > 0) {
  console.log(items[0]);
}
```

---

## 🔐 القسم السادس: أخطاء الأمان

### 1. XSS (Cross-Site Scripting)
**المشكلة:**
```typescript
// ❌ خطر
<div innerHTML={userInput} />
```

**الحل:**
```typescript
// ✅ آمن
import { escapeHtml } from "@/lib/security/sanitization";
<div>{escapeHtml(userInput)}</div>
```

---

### 2. CSRF (Cross-Site Request Forgery)
- تأكد من استخدام HTTPS
- استخدم CSRF tokens

---

## ⚡ القسم السابع: أخطاء الأداء

### 1. Unnecessary Re-renders
**الحل:**
```typescript
// استخدم useMemo
const memoizedValue = useMemo(() => {
  return expensive operation
}, [dependencies])
```

---

### 2. Slow API Calls
**الحل:**
```typescript
// استخدم debounce
const debounced = useCallback(
  debounce((value) => {
    handleSearch(value);
  }, 300),
  []
);
```

---

## 🧪 القسم الثامن: أخطاء Testing

### 1. Hydration Mismatch
**السبب:** الـ HTML على الـ client يختلف عن الـ server

**الحل:**
```typescript
// استخدم useEffect للعمليات الـ client-only
useEffect(() => {
  // client-only code
}, []);
```

---

## 🎯 Debugging Tips

### 1. استخدام Console Logs
```typescript
console.log("Debug:", { value, status, error });
```

### 2. استخدام DevTools
- Browser DevTools
- React DevTools
- Network Tab

### 3. استخدام Error Boundaries
```typescript
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

---

## 📊 Checklist للمشاكل الشائعة

- [ ] هل تحققت من TypeScript errors؟
- [ ] هل تحققت من ESLint warnings؟
- [ ] هل اختبرت على browsers مختلفة؟
- [ ] هل تحققت من responsive design؟
- [ ] هل اختبرت على mobile؟
- [ ] هل تحققت من الأداء (Lighthouse)؟
- [ ] هل تحققت من الأمان؟

---

## 📞 الدعم الفني

إذا لم تتمكن من حل المشكلة:

1. اقرأ الخطأ كاملاً
2. ابحث عن الخطأ في Google
3. راجع Documentation الـ library
4. اطلب مساعدة من الفريق

---

**آخر تحديث:** 13 مايو 2026

