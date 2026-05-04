# 🆘 Troubleshooting Guide - Frontend Issues

## المشاكل الشائعة والحلول السريعة

### 1. ❌ "Module not found"

**الأعراض:**
```
Module not found: Can't resolve '@/components/something'
```

**الحل:**
```bash
# تحقق من المسار النسبي
# صحيح: @/components/jobs/job-card
# خطأ: @/components/jobs/job-card.tsx (لا تضف .tsx)

# تحقق من tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### 2. ❌ "Type error: Property 'X' does not exist"

**الأعراض:**
```
Type error: Property 'salaryRange' does not exist on type 'Job'
```

**الحل:**
```typescript
// 1. تحقق من الـ interface:
interface Job {
  id: number;
  title: string;
  // تأكد أن الحقل موجود
}

// 2. استخدم الحقول الموجودة فقط:
{job.title}  // ✅ صحيح
{job.salaryRange}  // ❌ خطأ - غير موجود

// 3. استخدم optional chaining:
{job.description?.length > 0 && <p>{job.description}</p>}
```

---

### 3. ❌ "createMotionComponent() from the server"

**الأعراض:**
```
Attempted to call createMotionComponent() from the server but 
createMotionComponent is on the client
```

**الحل:**
```typescript
// أضف "use client" في أعلى الملف
"use client";

import { motion } from "framer-motion";

export function MyComponent() {
  return <motion.div>Content</motion.div>;
}
```

---

### 4. ❌ "asChild prop error"

**الأعراض:**
```
Type 'string' is not assignable to type 'never'
```

**الحل:**
```typescript
// تأكد من تثبيت @radix-ui/react-slot
npm install @radix-ui/react-slot

// استخدم بشكل صحيح:
import { Button } from "@/components/ui/button";

<Button asChild>
  <Link href="/jobs">Browse</Link>
</Button>
```

---

### 5. ❌ "Variant not found"

**الأعراض:**
```
Type '"neon"' is not assignable to type '"default" | "primary" | "ghost"'
```

**الحل:**
```typescript
// الاستخدام الصحيح:
<Button variant="primary">Text</Button>  // ✅
<Button variant="ghost">Text</Button>    // ✅
<Button variant="default">Text</Button>  // ✅
<Button variant="danger">Text</Button>   // ✅

// لا تستخدم:
<Button variant="neon">Text</Button>     // ❌
```

---

### 6. ❌ "Argument of type 'string' not assignable"

**الأعراض:**
```
Argument of type 'string' is not assignable to parameter of 
type '(filters: JobSearchFormState) => void'
```

**الحل:**
```typescript
// ❌ خطأ:
const handleSearch = (e?: React.FormEvent) => { };
<JobSearchFilter onSearch={handleSearch} />

// ✅ صحيح:
const handleSearch = (filters: JobSearchFormState) => {
  setAppliedFilters(filters);
};
<JobSearchFilter onSearch={handleSearch} />
```

---

### 7. ❌ Build fails with "Unsupported metadata"

**الأعراض:**
```
⚠ Unsupported metadata themeColor is configured in metadata export
```

**الحل:**
```typescript
// في ملفات layout.tsx أو page.tsx:

// ❌ القديم:
export const metadata = {
  title: "JobFinder",
  themeColor: "#8b2cf5"
};

// ✅ الجديد:
export const metadata = {
  title: "JobFinder"
};

export const viewport = {
  themeColor: "#8b2cf5"
};
```

---

### 8. ❌ "Cannot find name 'React'"

**الأعراض:**
```
Cannot find name 'React'. Did you mean 'react'?
```

**الحل:**
```typescript
// React 17+ لا يحتاج import React
// ✅ لا تحتاج:
// import React from "react";

// ✅ استخدم مباشرة:
export function MyComponent() {
  return <div>Content</div>;
}
```

---

### 9. ❌ "Cannot use JSX outside of React component"

**الأعراض:**
```
'React' is not defined
```

**الحل:**
```typescript
// في ملفات عادية (utils):
// ❌ لا تستخدم JSX

// في مكونات React:
// ✅ استخدم JSX مع "use client"
"use client";

export function MyComponent() {
  return <div>Content</div>;
}
```

---

### 10. ❌ "className conflicts"

**الأعراض:**
```
Tailwind classes seem conflicting or not applying
```

**الحل:**
```typescript
import { cn } from "@/lib/utils";

// استخدم cn() لدمج الفئات:
<div className={cn(
  "p-4 rounded-lg",  // قاعدي
  isSomething && "bg-red-500",  // شرطي
  className  // من الـ props
)}>
  Content
</div>
```

---

## 🔍 خطوات التصحيح العامة

### 1. تحقق من الخطأ بعناية
```bash
# اقرأ رسالة الخطأ بالكامل
# ابحث عن رقم السطر (line number)
# افتح الملف في رقم السطر المحدد
```

### 2. تحقق من الأنواع
```bash
# استخدم VSCode IntelliSense
# مرّر الفأرة على المتغير لترى نوعه
# استخدم Ctrl+Click للقفز إلى التعريف
```

### 3. نظف وأعد البناء
```bash
# حذف .next folder
rm -rf .next

# أعد البناء
npm run build
```

### 4. استخدم React DevTools
```bash
# ثبت React DevTools من Chrome Web Store
# استخدمها لتتبع الـ state والـ props
# ابحث عن الـ re-renders غير الضرورية
```

---

## 💡 نصائح سريعة

| الخطأ | الحل السريع |
|---|---|
| Type errors | اتبع TypeScript suggestions من VSCode |
| Build issues | جرب `npm run build` مرة أخرى |
| CSS not working | تحقق من اسم الفئة في Tailwind |
| Component not rendering | تأكد من `"use client"` في أعلى الملف |
| Props errors | استخدم TypeScript interfaces |
| Import errors | استخدم `@/` بدلاً من المسارات النسبية |

---

## 📞 متى تطلب مساعدة

- ❌ إذا كان الخطأ غير واضح
- ❌ إذا جربت الحل 3 مرات ولم ينجح
- ❌ إذا كان الخطأ يتعلق بـ Backend
- ✅ في بقية الحالات: استخدم هذا الدليل

---

**تم الإعداد:** April 29, 2026  
**الحالة:** ✅ Verified Solutions

