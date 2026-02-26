package jobfinder.model.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter@Setter@AllArgsConstructor@NoArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false, length = 150)
    private String username;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 20)
    private String role;

    // السطر ده بنخلي الحساب مفعل تلقائياً عشان نعرف نستي براحتنا
    @Column(nullable = false)
    private boolean enabled = true;

    // بنحتاج عداد يعرفنا اليوزر غلط كام مرة
    @Column(name = "failed_attempts", nullable = false)
    private Integer failedAttempts = 0;

    // وبنحتاج "ساعة" تقولنا الحظر هيخلص إمتى
    @Column(name = "lockout_time")
    private LocalDateTime lockoutTime;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<OtpCode> otpCodes;

    // 👇 ده أحسن من تعيين القيمة مباشرة
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }



}
