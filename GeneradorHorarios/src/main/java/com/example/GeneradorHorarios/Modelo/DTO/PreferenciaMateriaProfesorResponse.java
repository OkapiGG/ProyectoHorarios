package com.example.GeneradorHorarios.Modelo.DTO;

import com.example.GeneradorHorarios.Modelo.PreferenciaMateriaProfesor;
import com.example.GeneradorHorarios.Modelo.Profesor;
import com.example.GeneradorHorarios.Modelo.enums.NivelPreferenciaMateria;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PreferenciaMateriaProfesorResponse {
    private Long idPreferenciaMateria;
    private Long idProfesor;
    private String nombreProfesor;
    private Long idMateria;
    private String claveMateria;
    private String nombreMateria;
    private Long idPeriodoAcademico;
    private String descripcionPeriodo;
    private NivelPreferenciaMateria nivelPreferencia;
    private String observaciones;

    public static PreferenciaMateriaProfesorResponse fromEntity(PreferenciaMateriaProfesor preferencia) {
        Profesor profesor = preferencia.getProfesor();
        String nombreProfesor = String.join(" ",
                profesor.getNomProfesor() != null ? profesor.getNomProfesor() : "",
                profesor.getApPaternoProfesor() != null ? profesor.getApPaternoProfesor() : "",
                profesor.getApMaternoProfesor() != null ? profesor.getApMaternoProfesor() : ""
        ).trim().replaceAll("\\s+", " ");

        return new PreferenciaMateriaProfesorResponse(
                preferencia.getIdPreferenciaMateria(),
                profesor.getIdProfesor(),
                nombreProfesor,
                preferencia.getMateria().getIdMateria(),
                preferencia.getMateria().getClaveMateria(),
                preferencia.getMateria().getNombreMateria(),
                preferencia.getPeriodoAcademico().getIdPeriodoAcademico(),
                preferencia.getPeriodoAcademico().getDescripcion(),
                preferencia.getNivelPreferencia(),
                preferencia.getObservaciones()
        );
    }
}
