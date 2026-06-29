package jobfinder.services.implementation;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;

@Service
@Slf4j
public class EmailValidatorService {

    public boolean isEmailDomainValid(String email) {

        // 1. Null/format guard — prevents NPE and bad substring
        if (email == null || !email.contains("@")) return false;

        String domain = email.substring(email.indexOf("@") + 1);

        // 2. Basic format check (ensure domain is not empty and contains a dot)
        if (domain.isBlank() || !domain.contains(".")) return false;

        DirContext ictx = null;
        try {
            // 3. Perform DNS Lookup with a timeout (Performance Optimization)
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");

            // Timeout settings: Prevents the application from hanging if the DNS server is unresponsive
            env.put("com.sun.jndi.dns.timeout.initial", "2000"); // 2 seconds
            env.put("com.sun.jndi.dns.timeout.retries", "1");

            ictx = new InitialDirContext(env);

            // Retrieve the MX (Mail Exchange) records for the domain
            Attributes attrs = ictx.getAttributes(domain, new String[] {"MX"});
            Attribute attr = attrs.get("MX");

            // Return true if at least one MX record is found
            return (attr != null && attr.size() > 0);

        } catch (Exception e) {
            // Log the failure (e.g., domain does not exist or network issues)
            log.warn("DNS Validation failed for email: {} - Error: {}", email, e.getMessage());
            return false;
        } finally {
            // 4. Always close DirContext to prevent JNDI connection leak
            if (ictx != null) {
                try {
                    ictx.close();
                } catch (Exception ignored) {
                    // closing best-effort
                }
            }
        }
    }
}