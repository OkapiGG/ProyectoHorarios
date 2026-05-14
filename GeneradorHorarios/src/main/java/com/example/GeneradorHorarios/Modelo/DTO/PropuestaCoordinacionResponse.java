package com.example.GeneradorHorarios.Modelo.DTO;

import com.example.GeneradorHorarios.Modelo.PropuestaDisponibilidad;
import com.example.GeneradorHorarios.Modelo.Profesor;
import com.example.GeneradorHorarios.Modelo.enums.EstadoPropuesta;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class PropuestaCoordinacionResponse {
    private Long idProDisponibilidad;
    private Long idProfesor;
    private String nombreProfesor;
    private String areaConocimiento;
    private Long idPeriodoAcademico;
    private String descripcionPeriodo;
    private LocalDate fechaEntrega;
    private EstadoPropuesta estado;

    public static PropuestaCoordinacionResponse fromEntity(PropuestaDisponibilidad propuestaDisponibilidad) {
        Profesor profesor = propuestaDisponibilidad.getProfesor();

        String nombreProfesor = String.join(" ",
                profesor.getNomProfesor() != null ? profesor.getNomProfesor() : "",
                profesor.getApPaternoProfesor() != null ? profesor.getApPaternoProfesor() : "",
                profesor.getApMaternoProfesor() != null ? profesor.getApMaternoProfesor() : ""
        ).trim().replaceAll("\\s+", " ");

        return new PropuestaCoordinacionResponse(
                propuestaDisponibilidad.getIdProDisponibilidad(),
                profesor.getIdProfesor(),
                nombreProfesor,
                profesor.getAreaConocimiento(),
                propuestaDisponibilidad.getPeriodoAcademico().getIdPeriodoAcademico(),
                propuestaDisponibilidad.getPeriodoAcademico().getDescripcion(),
                propuestaDisponibilidad.getFechaEntrega(),
                propuestaDisponibilidad.getEstado()
        );
    }
}
