package jobfinder.services.interfaces;

import jobfinder.model.dto.UpdateUserProfileRequest;
import jobfinder.model.dto.UserProfileResponse;

/**
 * Interface for User Profile Service
 * يعرّف الوظائف المتاحة للتعامل مع بيانات البروفايل
 */
public interface UserProfileInterface {

    /**
     * الحصول على بيانات البروفايل للمستخدم الحالي
     * @return بيانات البروفايل
     */
    UserProfileResponse getMyProfile();

    /**
     * تحديث بيانات البروفايل للمستخدم الحالي
     * @param request بيانات التحديث
     * @return البروفايل المحدّث
     */
    UserProfileResponse updateMyProfile(UpdateUserProfileRequest request);

    /**
     * الحصول على بيانات البروفايل لمستخدم معين (للإداريين فقط)
     * @param userId معرف المستخدم
     * @return بيانات البروفايل
     */
    UserProfileResponse getUserProfile(Long userId);
}

