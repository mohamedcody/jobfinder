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
        try {
            String domain = email.substring(email.indexOf("@") + 1);

            // 1. A fast regex check as the first line of defense.
            if (domain.isBlank() || !domain.contains(".")) return false;

            // 2. Set up DNS lookup with a timeout.
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
            
            // Very important: if DNS does not respond within two seconds, stop the request and avoid blocking the server.
            env.put("com.sun.jndi.dns.timeout.initial", "2000"); 
            env.put("com.sun.jndi.dns.timeout.retries", "1");

            DirContext ictx = new InitialDirContext(env);
            Attributes attrs = ictx.getAttributes(domain, new String[] {"MX"});
            Attribute attr = attrs.get("MX");

            return (attr != null && attr.size() > 0);
        } catch (Exception e) {
            log.warn("DNS Validation failed for email: {} - Error: {}", email, e.getMessage());

            return false; 
        }
    }
}