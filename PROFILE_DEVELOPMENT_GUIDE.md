# 🛠️ Guide للتطوير المستقبلي على Profile System

## 📌 المبادئ التوجيهية

هذا الدليل يساعدك على فهم كيفية إضافة ميزات جديدة للبروفايل دون كسر الكود الموجود.

---

## 1️⃣ إضافة حقل جديد للبروفايل

### الخطوة 1: أضف الحقل في Database Entity
**ملف:** `backend/src/main/java/jobfinder/model/entity/UserProfile.java`

```java
@Entity
@Table(name = "user_profiles")
public class UserProfile {
    // ...existing fields...
    
    // ✅ أضف الحقل الجديد هنا
    @Column(name = "new_field")
    private String newField;
    
    @Column(name = "new_field_created_at")
    private LocalDateTime newFieldCreatedAt;
}
```

### الخطوة 2: أضف في DTOs

**1. UserProfileResponse:**
```java
@Data
public class UserProfileResponse {
    // ...existing fields...
    
    @JsonProperty("new_field")
    private String newField;
    
    @JsonProperty("new_field_created_at")
    private LocalDateTime newFieldCreatedAt;
}
```

**2. UpdateUserProfileRequest:**
```java
@Data
public class UpdateUserProfileRequest {
    // ...existing fields...
    
    @JsonProperty("new_field")
    @Size(max = 100)
    private String newField;
}
```

### الخطوة 3: أضف في Frontend Types
**ملف:** `frontend/src/lib/profile/types.ts`

```typescript
export interface UserProfileResponse {
  // ...existing fields...
  new_field?: string | null;
  new_field_created_at?: string;
}

export interface UpdateUserProfileRequest {
  // ...existing fields...
  new_field?: string;
}
```

### الخطوة 4: أضف في Component
**ملف:** `frontend/src/components/profile/user-profile.tsx`

```tsx
{/* جديد */}
<div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    New Field Label
  </label>
  <input
    type="text"
    name="new_field"
    value={formData.new_field || ""}
    onChange={handleChange}
    disabled={!isEditing}
    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white disabled:opacity-50 transition"
    placeholder="Enter new field value"
  />
</div>
```

### الخطوة 5: أضف في Service
**ملف:** `backend/src/main/java/jobfinder/services/implementation/UserProfileService.java`

في method `updateProfileFields`:
```java
if (request.getNewField() != null) {
    profile.setNewField(request.getNewField());
    profile.setNewFieldCreatedAt(LocalDateTime.now());
}
```

---

## 2️⃣ إضافة Query جديدة للـ Repository

### مثال: البحث عن مستخدمين بحسب الوظيفة

**ملف:** `backend/src/main/java/jobfinder/repository/UserProfileRepository.java`

```java
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    // ...existing methods...
    
    // ✅ اضف الـ query الجديدة
    @Query("SELECT up FROM UserProfile up " +
           "WHERE LOWER(up.currentJobTitle) LIKE LOWER(CONCAT('%', :jobTitle, '%')) " +
           "AND up.isOpenToWork = true")
    List<UserProfile> findOpenProfilesByJobTitle(@Param("jobTitle") String jobTitle);
}
```

### استخدمها في Service
```java
@Transactional(readOnly = true)
public List<UserProfileResponse> findOpenProfilesByJobTitle(String jobTitle) {
    List<UserProfile> profiles = userProfileRepository.findOpenProfilesByJobTitle(jobTitle);
    return profiles.stream()
        .map(this::mapToResponse)
        .collect(Collectors.toList());
}
```

---

## 3️⃣ إضافة Endpoint جديد

### مثال: Endpoint لـ Statistics

**ملف:** `backend/src/main/java/jobfinder/controller/UserProfileController.java`

```java
/**
 * الحصول على إحصائيات البروفايل
 */
@Operation(summary = "Get profile statistics")
@GetMapping("/statistics")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<ProfileStatisticsResponse> getProfileStatistics() {
    log.info("Fetching profile statistics");
    ProfileStatisticsResponse stats = userProfileService.getProfileStatistics();
    return ResponseEntity.ok(stats);
}
```

### الـ Service Method
```java
public ProfileStatisticsResponse getProfileStatistics() {
    Long userId = getCurrentUserId();
    UserProfile profile = userProfileRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
    
    return ProfileStatisticsResponse.builder()
        .profileCompleteness(calculateCompleteness(profile))
        .viewCount(profile.getViewCount())
        .applicationCount(profile.getApplicationCount())
        .build();
}
```

---

## 4️⃣ إضافة Validation جديدة

### في Backend
**ملف:** `backend/src/main/java/jobfinder/model/dto/UpdateUserProfileRequest.java`

```java
@Data
public class UpdateUserProfileRequest {
    // ...existing validations...
    
    @JsonProperty("custom_field")
    @NotBlank(message = "Custom field is required")
    @Size(min = 5, max = 100, message = "Length must be between 5 and 100")
    private String customField;
}
```

### في Frontend
**ملف:** `frontend/src/lib/profile/types.ts`

```typescript
export const PROFILE_VALIDATION_RULES = {
    // ...existing rules...
    
    customField: {
        minLength: 5,
        maxLength: 100,
    },
};
```

### في Component
```tsx
// في validateForm method
if (
  formData.customField &&
  (formData.customField.length < 5 || formData.customField.length > 100)
) {
  toast.error("Custom field must be between 5 and 100 characters");
  return false;
}
```

---

## 5️⃣ إضافة Service Method جديد

### مثال: تنزيل البروفايل كـ PDF

**ملف:** `backend/src/main/java/jobfinder/services/implementation/UserProfileService.java`

```java
public byte[] exportProfileAsPDF() {
    Long userId = getCurrentUserId();
    UserProfile profile = userProfileRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
    
    // استخدم library مثل iText أو Apache PDFBox
    return generatePDFFromProfile(profile);
}

private byte[] generatePDFFromProfile(UserProfile profile) {
    // implementation
    return new byte[0];
}
```

### في Controller
```java
@GetMapping("/export-pdf")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<byte[]> exportProfileAsPDF() {
    byte[] pdfContent = userProfileService.exportProfileAsPDF();
    return ResponseEntity.ok()
        .header("Content-Type", "application/pdf")
        .header("Content-Disposition", "attachment; filename=profile.pdf")
        .body(pdfContent);
}
```

### في Frontend
```tsx
const handleExportPDF = async () => {
  try {
    const response = await apiClient.get('/users/profile/export-pdf', {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'profile.pdf');
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    toast.error("Failed to export profile");
  }
};
```

---

## 6️⃣ Error Handling الصحيح

### في Backend
```java
try {
    UserProfile profile = userProfileRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
    
    updateProfileFields(profile, request);
    userProfileRepository.save(profile);
    
    log.info("Profile updated successfully for user: {}", userId);
} catch (ResourceNotFoundException e) {
    log.error("Resource not found: {}", e.getMessage());
    throw e;
} catch (Exception e) {
    log.error("Unexpected error updating profile", e);
    throw new RuntimeException("Failed to update profile", e);
}
```

### في Frontend
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    await updateProfile(formData);
    toast.success("Profile updated successfully!");
  } catch (error: unknown) {
    if (isAuthError(error)) {
      toast.error("Session expired. Please login again.");
      // redirect to login
    } else if (isValidationError(error)) {
      toast.error("Please check your input and try again");
    } else {
      toast.error("Failed to update profile");
    }
  }
};
```

---

## 7️⃣ Testing

### Backend Unit Test
```java
@SpringBootTest
public class UserProfileServiceTest {
    
    @MockBean
    private UserProfileRepository profileRepository;
    
    @InjectMocks
    private UserProfileService profileService;
    
    @Test
    public void testUpdateProfile() {
        // setup
        UserProfile profile = UserProfile.builder().build();
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        when(profileRepository.save(any())).thenReturn(profile);
        
        // execute
        UpdateUserProfileRequest request = UpdateUserProfileRequest.builder()
            .currentJobTitle("Senior Developer")
            .build();
        
        // verify
        assertDoesNotThrow(() -> profileService.updateMyProfile(request));
    }
}
```

### Frontend Hook Test
```tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserProfile } from '@/hooks/profile';

test('should update profile', async () => {
  const { result } = renderHook(() => useUserProfile());
  
  await waitFor(() => {
    expect(result.current.profile).toBeDefined();
  });
  
  await act(async () => {
    await result.current.updateProfile({
      current_job_title: 'Tech Lead'
    });
  });
  
  expect(result.current.profile?.current_job_title).toBe('Tech Lead');
});
```

---

## 🎯 Checklist للإضافة الجديدة

- [ ] أضفت الحقل في Entity
- [ ] أضفته في التوابع (getters/setters) - Lombok يفعل هذا
- [ ] أضفته في DTOs (Response و Request)
- [ ] أضفته في Frontend Types
- [ ] أضفت Validation Rules
- [ ] أضفت في Service Implementation
- [ ] أضفت في Component Form
- [ ] اختبرت الـ Integration
- [ ] Documented الـ Change
- [ ] تأكدت من الـ Security

---

## 📖 الملفات الرئيسية

| ملف | الهدف |
|------|------|
| `UserProfile.java` | Entity (Database Schema) |
| `UserProfileRepository.java` | Database Queries |
| `UserProfileService.java` | Business Logic |
| `UserProfileController.java` | API Endpoints |
| `UserProfileResponse.java` | API Response DTO |
| `UpdateUserProfileRequest.java` | API Request DTO |
| `types.ts` | Frontend TypeScript Types |
| `service.ts` | Frontend API Client |
| `use-user-profile.ts` | Frontend Hook |
| `user-profile.tsx` | Frontend Component |

---

## ⚠️ أشياء جب الانتباه لها

❌ **لا تفعل:**
- تعديل الـ Entity بدون تحديث DTOs
- حذف حقول قديمة بدون إنشاء migration
- نسيان إضافة validation في Frontend و Backend معاً
- عدم تحديث الـ documentation

✅ **افعل:**
- اختبر كل تغيير قبل الدفع
- اكتب تعليقات واضحة في الكود
- اتبع نفس الـ Pattern المستخدم حالياً
- أضف logging للـ debugging

---

## 🚀 سريع Reference

```bash
# تشغيل Backend
cd backend && ./mvnw spring-boot:run

# تشغيل Frontend
cd frontend && npm run dev

# تشغيل Tests
cd backend && ./mvnw test
cd frontend && npm test

# Build Production
cd backend && ./mvnw clean package -DskipTests
cd frontend && npm run build
```

---

Happy Coding! 🎉

