package jobfinder.model.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "otp_codes", indexes = {
        // تحسين الـ Index ليشمل used عشان سرعة البحث في الـ Service
        @Index(name = "idx_otp_user_code_status", columnList = "user_id, code, used")
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OtpCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 6)
    private String code;

    @Column(nullable = false)
    private LocalDateTime expiryTime;

    private boolean used = false;

    @Builder.Default // مهمة جداً عشان الـ Builder يشوف الـ 0
    @Column(nullable = false)
    private Integer attempts = 0;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();


}
