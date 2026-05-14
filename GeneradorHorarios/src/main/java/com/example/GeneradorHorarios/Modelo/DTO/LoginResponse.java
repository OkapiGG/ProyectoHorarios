package com.example.GeneradorHorarios.Modelo.DTO;

import com.example.GeneradorHorarios.Modelo.enums.Rol;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private Long idUsuario;
    private String correo;
    private Rol rol;
    private Boolean activo;
    private Long idProfesor;
    private String nombreProfesor;
    private String areaConocimiento;
}
