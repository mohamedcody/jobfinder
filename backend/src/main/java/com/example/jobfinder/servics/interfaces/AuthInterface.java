package jobfinder.servics.interfaces;

import jobfinder.model.dto.AuthResponse;
import jobfinder.model.dto.LoginRequest;
import jobfinder.model.dto.RegisterRequest;

public interface AuthInterface {


    AuthResponse login (LoginRequest request);

    AuthResponse register (RegisterRequest request);



}
