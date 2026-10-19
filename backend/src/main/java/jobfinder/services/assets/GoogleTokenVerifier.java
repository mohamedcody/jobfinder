package jobfinder.services.assets;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import jobfinder.exception.BaseException;
import jobfinder.exception.ErrorCode;
import jobfinder.model.dto.GoogleIdentity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleTokenVerifier {

    private final GoogleIdTokenVerifier verifier;

    @org.springframework.beans.factory.annotation.Autowired
    public GoogleTokenVerifier(@Value("${google.oauth.client-id}") String clientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                .build();
    }

    public GoogleTokenVerifier(GoogleIdTokenVerifier verifier) {
        this.verifier = verifier;
    }

    public GoogleIdentity verify(String idTokenString) {
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();

                Boolean emailVerified = payload.getEmailVerified();
                if (emailVerified == null || !emailVerified) {
                    throw new BaseException(ErrorCode.INVALID_CREDENTIALS, "Google email is not verified.");
                }

                String subject = payload.getSubject();
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                return new GoogleIdentity(subject, email, name);
            } else {
                throw new BaseException(ErrorCode.INVALID_CREDENTIALS, "Invalid Google ID token.");
            }
        } catch (BaseException e) {
            throw e;
        } catch (Exception e) {
            throw new BaseException(ErrorCode.INVALID_CREDENTIALS, "Failed to verify Google token: " + e.getMessage());
        }
    }
}
