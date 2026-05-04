# User Profile Endpoints - Documentation

## 📋 الملخص السريع

تم إنشاء نظام كامل لإدارة بيانات البروفايل الشخصي للمستخدم مع دعم:

- ✅ جلب بيانات البروفايل (GET `/api/users/profile`)
- ✅ تحديث البروفايل (PUT `/api/users/profile`)
- ✅ تحديثات جزئية (Partial Updates)
- ✅ معالجة الأخطاء الشاملة
- ✅ التحقق من صحة البيانات (Frontend + Backend)
- ✅ تكامل آمن مع JWT Authentication

---

## 🔌 Backend Endpoints

### 1. الحصول على البروفايل

```http
GET /api/users/profile
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "username": "ahmed_dev",
  "email": "ahmed@example.com",
  "current_job_title": "Senior Backend Developer",
  "years_of_experience": 5,
  "education_level": "Bachelor",
  "country": "Egypt",
  "city": "Cairo",
  "resume_url": "https://example.com/resume.pdf",
  "expected_salary": 50000,
  "currency": "USD",
  "is_open_to_work": true,
  "bio": "Passionate developer with 5 years of experience...",
  "updated_at": "2026-04-30T10:30:00"
}
```

**Error Responses:**

- `401 Unauthorized` - غير مصرح أو Token منتهي الصلاحية
- `404 Not Found` - البروفايل غير موجود
- `500 Internal Server Error` - خطأ في الخادم

---

### 2. تحديث البروفايل

```http
PUT /api/users/profile
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body (يدعم التحديثات الجزئية):**
```json
{
  "current_job_title": "Tech Lead",
  "years_of_experience": 6,
  "city": "Alexandria"
}
```

**يمكنك تحديث حقل واحد فقط:**
```json
{
  "bio": "Updated bio description"
}
```

**Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "username": "ahmed_dev",
  "email": "ahmed@example.com",
  "current_job_title": "Tech Lead",
  "years_of_experience": 6,
  "education_level": "Bachelor",
  "country": "Egypt",
  "city": "Alexandria",
  "resume_url": "https://example.com/resume.pdf",
  "expected_salary": 50000,
  "currency": "USD",
  "is_open_to_work": true,
  "bio": "Updated bio description",
  "updated_at": "2026-04-30T11:45:00"
}
```

**Validation Errors (400):**
```json
{
  "message": "Years of experience must be between 0 and 70"
}
```

---

## 🎯 Frontend Usage

### Installation (if needed)
```bash
cd frontend
npm install axios react-hot-toast
```

### 1. استخدام Hook في Component

```tsx
import { useUserProfile } from '@/hooks/profile';

export function MyProfilePage() {
  const { profile, loading, error, updateProfile, refetch } = useUserProfile();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        current_job_title: "Senior Developer",
        years_of_experience: 6
      });
      alert("Profile updated!");
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  return (
    <div>
      <h1>{profile?.username}</h1>
      <p>Title: {profile?.current_job_title}</p>
      <button onClick={handleUpdateProfile}>Update Profile</button>
    </div>
  );
}
```

### 2. استخدام Service Directly

```tsx
import { fetchUserProfile, updateUserProfile } from '@/lib/profile/service';

// جلب البروفايل
const profile = await fetchUserProfile();
console.log(profile.username);

// تحديث البروفايل
const updated = await updateUserProfile({
  current_job_title: "Tech Lead",
  city: "Cairo"
});
```

### 3. Component الكامل المرفق

قدمت `UserProfileComponent` جاهزة للاستخدام:

```tsx
import { UserProfileComponent } from '@/components/profile/user-profile';

export default function ProfilePage() {
  return (
    <div>
      <UserProfileComponent />
    </div>
  );
}
```

---

## 📝 Validation Rules

### Frontend + Backend

| الحقل | الحد الأقصى | الحد الأدنى | الصيغة |
|------|-----------|-----------|------|
| current_job_title | 150 حرف | - | نص عادي |
| years_of_experience | 70 سنة | 0 سنة | أرقام |
| education_level | 100 حرف | - | نص |
| country | 100 حرف | - | نص |
| city | 100 حرف | - | نص |
| resume_url | 500 حرف | - | URL |
| expected_salary | ∞ | 0 | أرقام موجبة |
| currency | 3 أحرف | - | `USD`, `EUR`, `EGP` |
| bio | 1000 حرف | - | نص طويل |

---

## 🔐 Security & Best Practices

### Authentication
- جميع الـ endpoints محمية بـ JWT Token
- Token يُضاف تلقائياً من `localStorage` في كل request
- إذا انتهت صلاحية Token، سيحصل المستخدم على 401 Unauthorized

### Authorization
- المستخدم يمكنه فقط تعديل بروفايله الخاص
- الإداريين فقط يمكنهم الوصول لـ `/api/users/profile/{userId}`

### Input Validation
- Backend يتحقق من صحة جميع البيانات
- Frontend يعرض error messages واضحة للمستخدم
- لا توجد ثغرات SQL injection

---

## 🚀 Advanced Usage

### تحديث حقل واحد بشكل مباشر

```tsx
import { useUpdateProfileField } from '@/hooks/profile';

export function UpdateJobTitleForm() {
  const updateField = useUpdateProfileField();
  const [jobTitle, setJobTitle] = useState('');

  const handleUpdate = async () => {
    try {
      await updateField('current_job_title', jobTitle);
      alert("Job title updated!");
    } catch (err) {
      alert("Failed to update");
    }
  };

  return (
    <div>
      <input 
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
      />
      <button onClick={handleUpdate}>Save</button>
    </div>
  );
}
```

### الاستماع لـ Changes

```tsx
import { useUserProfile } from '@/hooks/profile';
import { useEffect } from 'react';

export function ProfileMonitor() {
  const { profile, refetch } = useUserProfile();

  useEffect(() => {
    const interval = setInterval(refetch, 30000); // تحديث كل 30 ثانية
    return () => clearInterval(interval);
  }, [refetch]);

  return <div>Current profile: {profile?.username}</div>;
}
```

---

## 🧪 Testing مع Postman

### 1. جلب البروفايل
```
GET http://localhost:8080/api/users/profile
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### 2. تحديث البروفايل
```
PUT http://localhost:8080/api/users/profile
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
  Content-Type: application/json

Body:
{
  "current_job_title": "Tech Lead",
  "years_of_experience": 6
}
```

---

## 📊 File Structure

```
backend/
├── model/
│   ├── dto/
│   │   ├── UserProfileResponse.java
│   │   └── UpdateUserProfileRequest.java
│   └── entity/
│       └── UserProfile.java
├── repository/
│   └── UserProfileRepository.java (محدّث)
├── services/
│   ├── interfaces/
│   │   └── UserProfileInterface.java
│   └── implementation/
│       └── UserProfileService.java
└── controller/
    └── UserProfileController.java

frontend/
├── src/
│   ├── lib/
│   │   └── profile/
│   │       ├── types.ts
│   │       ├── service.ts
│   │       └── index.ts
│   ├── hooks/
│   │   └── profile/
│   │       ├── use-user-profile.ts
│   │       └── index.ts
│   └── components/
│       └── profile/
│           └── user-profile.tsx
```

---

## 🐛 Troubleshooting

### المشكلة: 401 Unauthorized
**الحل:** تأكد من وجود Token صحيح في `localStorage` وأنه لم ينتهِ

### المشكلة: 400 Bad Request
**الحل:** تحقق من البيانات المرسلة تطابق الـ validation rules

### المشكلة: 404 Not Found
**الحل:** البروفايل غير موجود. تأكد من أن المستخدم قام بـ verify email أولاً

### المشكلة: الـ form في الـ Component لا يظهر
**الحل:** تأكد من أن `useUserProfile` hook يعمل بشكل صحيح وأن البيانات تُجلب بنجاح

---

## 📚 Future Enhancements

- [ ] رفع صور البروفايل (Profile Picture)
- [ ] Social Media Links
- [ ] Certifications & Badges
- [ ] Portfolio Projects
- [ ] Skills Tags مع Auto-complete
- [ ] Export Profile as PDF

---

## ✅ الملخص

تم إنشاء نظام متكامل وآمن لإدارة البروفايل مع:
- ✅ Backend محترف مع validation شامل
- ✅ Frontend سهل الاستخدام مع React Hooks
- ✅ تحديثات جزئية (Partial Updates)
- ✅ معالجة أخطاء شاملة
- ✅ Documentation واضحة

الآن يمكنك استخدام هذا النظام مباشرة! 🎉

