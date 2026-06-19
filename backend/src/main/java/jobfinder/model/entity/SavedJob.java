package jobfinder.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "saved_jobs",
        uniqueConstraints = {
                // ✅ ده اللي بيمنع نفس الـ user يحفظ نفس الـ job مرتين على مستوى الـ DB
                // (مهم خصوصًا مع race conditions: two requests في نفس اللحظة)
                // لكن بنتجاهل الـ soft-deleted rows (حيث is_deleted = true)
                // للأسف PostgreSQL/MySQL لا يدعم partial unique indexes مباشرة في @UniqueConstraint
                // لذا نعتمد على الـ application logic والـ DB constraints
                @UniqueConstraint(name = "uk_saved_jobs_user_job", columnNames = {"user_id", "job_id"})
        },
        indexes = {
                // ✅ Index بسيط على user_id و is_deleted
                // بيسرّع جداً: getMySavedJobs / countSavedJobsByUserId / batch status checks
                // لأن كل الـ queries دي بتفلتر بـ (user_id + is_deleted) مع بعض كل مرة
                @Index(name = "idx_saved_jobs_user_active", columnList = "user_id, is_deleted"),

                // ✅ Index على job_id للـ cascade delete والـ foreign key checks
                @Index(name = "idx_saved_jobs_job", columnList = "job_id"),

                // ✅ Index على saved_at للـ sorting والـ pagination
                @Index(name = "idx_saved_jobs_created", columnList = "saved_at"),

                // ✅ Composite index للـ restore functionality
                // عندما نحاول restore (undo unsave)
                @Index(name = "idx_saved_jobs_restore", columnList = "user_id, job_id, is_deleted")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, updatable = false)
    // ✅ جديد: لو الـ user اتمسح (hard delete) من مكان تاني في السيستم، صفوف الـ saved_jobs
    // دي تتمسح معاه تلقائي على مستوى الـ DB نفسه، بدل ما الـ delete يفشل بـ FK violation
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id", nullable = false, updatable = false)
    // ✅ جديد: نفس الفكرة لكن أهم — JobEntity عنده cascade delete جاي من CompanyEntity
    // (لو حد مسح company، كل jobs بتاعتها بتتمسح). من غير ده، لو فيه job محفوظة عند
    // أي يوزر، الـ delete كان هيرمي foreign key constraint exception ويوقف العملية كلها
    @OnDelete(action = OnDeleteAction.CASCADE)
    private JobEntity job;

    @Column(name = "saved_at", nullable = false, updatable = false)
    // ✅ لا نسمح بـ update الـ saved_at — يبقى تاريخ الحفظ الأول
    // لو الـ user بدّل النوت، مش المفروض ننسى متى حفظنا الوظيفة
    @Builder.Default
    private LocalDateTime savedAt = LocalDateTime.now();

    @Column(length = 500)
    private String notes;

    @Column(name = "is_deleted", nullable = false)
    // ✅ soft delete flag — بنستخدمها بدل ما نعمل hard delete
    // الفوايد:
    // 1. أسرع من hard delete (مجرد UPDATE بـ boolean)
    // 2. نحافظ على البيانات التاريخية
    // 3. نسمح بـ restore functionality (undo unsave)
    @Builder.Default
    private boolean isDeleted = false;

    // ✅ جديد: حقل تاريخي لـ track متى اتعمل unsave (soft delete)
    // بيساعد في data analytics والـ restore functionality
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    /**
     * ✅ متى ما نعمل soft delete، نحدّث deletedAt
     * بتستخدمه الـ repository عند حذف الوظيفة المحفوظة
     */
    public void softDelete() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
    }

    /**
     * ✅ restore الوظيفة المحفوظة (undo unsave)
     */
    public void restore() {
        this.isDeleted = false;
        this.deletedAt = null;
    }
}