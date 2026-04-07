package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.Data;
import lombok.Getter;

@Data
public class LoginRequest {
    private String correo;
    private String password;
}
