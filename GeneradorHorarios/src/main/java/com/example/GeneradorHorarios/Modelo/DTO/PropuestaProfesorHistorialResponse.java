package com.example.GeneradorHorarios.Modelo.DTO;

import com.example.GeneradorHorarios.Modelo.PropuestaDisponibilidad;
import com.example.GeneradorHorarios.Modelo.enums.EstadoPropuesta;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class PropuestaProfesorHistorialResponse {
    private Long idProDisponibilidad;
    private Long idPeriodoAcademico;
    private String descripcionPeriodo;
    private LocalDate fechaEntrega;
    private EstadoPropuesta estado;

    public static PropuestaProfesorHistorialResponse fromEntity(PropuestaDisponibilidad propuestaDisponibilidad) {
        return new PropuestaProfesorHistorialResponse(
                propuestaDisponibilidad.getIdProDisponibilidad(),
                propuestaDisponibilidad.getPeriodoAcademico().getIdPeriodoAcademico(),
                propuestaDisponibilidad.getPeriodoAcademico().getDescripcion(),
                propuestaDisponibilidad.getFechaEntrega(),
                propuestaDisponibilidad.getEstado()
        );
    }
}
