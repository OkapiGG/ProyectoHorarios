package com.example.GeneradorHorarios.Modelo.DTO;

import com.example.GeneradorHorarios.Modelo.enums.Rol;
import lombok.Data;

@Data
public class UsuarioRequest {
    private String correo;
    private String passwordHash;
    private Rol rol;
    private Boolean activo;
    private Long idProfesor;
}
