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
                @UniqueConstraint(name = "uk_saved_jobs_user_job", columnNames = {"user_id", "job_id"})
        },
        indexes = {
                // ✅ جديد: بيسرّع getMySavedJobs / countSavedJobsByUserId / batch status check
                // لأن كل الـ queries دي بتفلتر بـ (user_id + is_deleted) مع بعض كل مرة
                @Index(name = "idx_saved_jobs_user_active", columnList = "user_id, is_deleted")
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    // ✅ جديد: لو الـ user اتمسح (hard delete) من مكان تاني في السيستم، صفوف الـ saved_jobs
    // دي تتمسح معاه تلقائي على مستوى الـ DB نفسه، بدل ما الـ delete يفشل بـ FK violation
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    // ✅ جديد: نفس الفكرة لكن أهم — JobEntity عنده cascade delete جاي من CompanyEntity
    // (لو حد مسح company، كل jobs بتاعتها بتتمسح). من غير ده، لو فيه job محفوظة عند
    // أي يوزر، الـ delete كان هيرمي foreign key constraint exception ويوقف العملية كلها
    @OnDelete(action = OnDeleteAction.CASCADE)
    private JobEntity job;

    @Column(name = "saved_at", nullable = false)
    private LocalDateTime savedAt = LocalDateTime.now();

    @Column(length = 500)
    private String notes;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;
}