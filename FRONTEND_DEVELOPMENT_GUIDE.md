# 📚 Frontend Development Guide - JobFinder PRO

## 🎯 معايير التطوير (Development Standards)

### 1. **هيكل المكونات (Component Structure)**

```typescript
// ✅ الطريقة الصحيحة:
"use client"; // إذا كنت تستخدم hooks أو interactive features

import { memo, useCallback } from "react";
import type { Props } from "@/types"; // استيراد الأنواع

interface ComponentProps {
  title: string;
  onClick?: () => void;
}

export const MyComponent = memo(function MyComponent({ 
  title, 
  onClick 
}: ComponentProps) {
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <div onClick={handleClick} className="p-4">
      {title}
    </div>
  );
});

MyComponent.displayName = "MyComponent";
```

### 2. **أنماط الأزرار (Button Patterns)**

```typescript
// استخدام مكون Button الموحد:
import { Button } from "@/components/ui/button";

// البديل 1: كزر عادي
<Button variant="primary" size="lg">
  Click me
</Button>

// البديل 2: مع asChild (wrapper حول Link)
<Button variant="primary" size="lg" asChild>
  <Link href="/jobs">
    Browse Jobs
  </Link>
</Button>

// البديل 3: مع icon
<Button variant="ghost" size="icon">
  <Heart className="h-5 w-5" />
</Button>
```

### 3. **معالجة الأخطاء (Error Handling)**

```typescript
// ✅ الطريقة الصحيحة:
import { toast } from "sonner";
import { getApiErrorMessage, isRequestCanceled } from "@/lib/auth/api-error";

try {
  const result = await apiCall();
  toast.success("Operation successful");
} catch (error) {
  if (isRequestCanceled(error)) {
    console.log("Request was canceled");
    return;
  }
  
  const message = getApiErrorMessage(error);
  toast.error(message);
  console.error("Operation failed:", error);
}
```

### 4. **الحالة والـ State Management (State Management)**

```typescript
// ✅ استخدام custom hooks:
import { useJobsSearch } from "@/hooks/use-jobs-search";

export function JobsPage() {
  const {
    jobs,
    isLoading,
    error,
    handleSearch,
    handleClearAll,
  } = useJobsSearch();

  // استخدم الـ hook بدلاً من إدارة الحالة محلياً
}

// ❌ تجنب:
// إدارة حالة معقدة مباشرة في الـ component
```

---

## 🔧 مهام شائعة

### إضافة صفحة جديدة

```typescript
// 1. أنشئ الملف: src/app/my-feature/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";

export default function MyFeaturePage() {
  const router = useRouter();

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-black text-white">My Feature</h1>
        {/* محتوى هنا */}
      </div>
    </AppLayout>
  );
}
```

### إنشاء مكون جديد

```typescript
// 1. أنشئ الملف: src/components/my-feature/my-component.tsx
"use client";

import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";

interface MyComponentProps {
  className?: string;
  children: React.ReactNode;
}

export const MyComponent = memo(function MyComponent({
  className,
  children,
}: MyComponentProps) {
  return (
    <div className={cn("rounded-lg bg-white/5 p-4", className)}>
      {children}
    </div>
  );
});

MyComponent.displayName = "MyComponent";
```

### استخدام Framer Motion

```typescript
// ✅ الطريقة الصحيحة:
import { motion, AnimatePresence } from "framer-motion";

export function AnimatedComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="p-4 bg-white/5 rounded-lg"
        >
          Content
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## 🎨 Tailwind CSS Guidelines

### الألوان المتاحة

```css
/* الألوان الأساسية */
--primary: #8b2cf5 (Violet)
--accent: #22d3ee (Cyan)
--success: #10b981 (Green)
--danger: #ef4444 (Red)
--warning: #f59e0b (Amber)

/* الاستخدام */
<div className="bg-violet-600 text-cyan-400">
  Primary + Accent
</div>
```

### الفئات المتكررة

```html
<!-- Buttons -->
<button className="btn-glow-primary btn-shine">Primary Button</button>

<!-- Cards -->
<div className="glass-panel">Card Content</div>

<!-- Text -->
<p className="metallic-title">Gradient Text</p>

<!-- Badges -->
<span className="neon-badge">Badge</span>
```

---

## 🧪 الاختبار والتصحيح (Testing & Debugging)

### تصحيح TypeScript Errors

```bash
# تشغيل بدقة TypeScript
npm run build

# أو استخدم الـ IDE
# الأخطاء تظهر مباشرة في VSCode
```

### تصحيح مشاكل الأداء

```typescript
// استخدام React DevTools Profiler:
// 1. افتح Chrome DevTools
// 2. اذهب إلى Profiler tab
// 3. ابدأ التسجيل وتفاعل مع التطبيق
// 4. ابحث عن الـ slow renders

// تحسين:
- استخدم memo() للـ components الثقيلة
- استخدم useCallback() لـ event handlers
- استخدم useMemo() للعمليات الحسابية الثقيلة
```

---

## 📋 قائمة التحقق قبل الـ Commit

- [ ] لا توجد أخطاء TypeScript: `npm run build`
- [ ] لا توجد تحذيرات في ESLint: `npm run lint`
- [ ] جربت الميزة محلياً: `npm run dev`
- [ ] أضفت تعليقات توضيحية حيث اللزوم
- [ ] استخدمت أسماء متغيرات واضحة
- [ ] لا توجد console.log() أو debug code

---

## 🚀 تشغيل المشروع

```bash
# التثبيت الأولي
cd frontend
npm install

# التطوير المحلي
npm run dev
# افتح http://localhost:3000

# البناء للإنتاج
npm run build

# تصحيح الأخطاء
npm run lint

# عرض البناء المُنتج
npm run start
```

---

## 📦 الحزم المشروعة

```json
{
  "dependencies": {
    "react": "19.2.3",
    "next": "16.2.3",
    "framer-motion": "^12.x.x",
    "tailwindcss": "^4.x.x",
    "@radix-ui/react-slot": "^2.x.x",
    "class-variance-authority": "^0.7.x",
    "sonner": "^2.x.x",
    "axios": "^1.x.x"
  }
}
```

---

## 🎓 موارد إضافية

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**آخر تحديث:** April 29, 2026  
**مستوى الجودة:** ⭐⭐⭐⭐⭐ Production Ready

