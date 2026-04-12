package jobfinder.servics.implemention;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {



    private final JavaMailSender mailSender ;

        @Async
    public void sendVerificationEmail(String email, String code) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(email);
                message.setSubject("JobFinder - Verify Your Account");
                message.setText("Your activation code is: " + code);
                mailSender.send(message);
            } catch (Exception e) {
                System.err.println("Error sending email: " + e.getMessage()); // هيطبعلك السبب هنا
            }
        }
}


