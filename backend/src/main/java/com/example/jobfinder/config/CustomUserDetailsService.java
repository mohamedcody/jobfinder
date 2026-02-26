package jobfinder.config;
import jobfinder.model.entity.User;
import jobfinder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {



    private  final UserRepository userRepository;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user = userRepository.findByUsername(username)
                .or(()->userRepository.findByEmail(username))
                .orElseThrow( () ->   new UsernameNotFoundException("user not found "+username) );


        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_"+ user.getRole());

        return new CustomUserDetails(
                user.getEmail(),
                user.getPassword(),
                List.of(authority)
        );


    }
}
