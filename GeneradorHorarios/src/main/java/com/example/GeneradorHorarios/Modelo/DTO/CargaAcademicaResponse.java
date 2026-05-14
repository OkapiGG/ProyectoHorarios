package com.example.GeneradorHorarios.Modelo.DTO;

import com.example.GeneradorHorarios.Modelo.CargaAcademica;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CargaAcademicaResponse {
    private Long idCargaAcademica;
    private Long idPlanDetalle;
    private Long idMateria;
    private String nombreMateria;
    private String claveMateria;
    private Long idGrupo;
    private String claveGrupo;
    private String turnoGrupo;
    private Integer semestreGrupo;
    private Long idProfesor;
    private String nombreProfesor;
    private String areaConocimientoProfesor;
    private Long idPeriodoAcademico;
    private String descripcionPeriodo;

    public static CargaAcademicaResponse fromEntity(CargaAcademica cargaAcademica) {
        String nombreProfesor = String.join(" ",
                cargaAcademica.getProfesor().getNomProfesor() != null ? cargaAcademica.getProfesor().getNomProfesor() : "",
                cargaAcademica.getProfesor().getApPaternoProfesor() != null ? cargaAcademica.getProfesor().getApPaternoProfesor() : "",
                cargaAcademica.getProfesor().getApMaternoProfesor() != null ? cargaAcademica.getProfesor().getApMaternoProfesor() : ""
        ).trim().replaceAll("\\s+", " ");

        return new CargaAcademicaResponse(
                cargaAcademica.getIdCargaAcademica(),
                cargaAcademica.getPlanEstudioDetalle().getIdPlanDetalle(),
                cargaAcademica.getPlanEstudioDetalle().getMateria().getIdMateria(),
                cargaAcademica.getPlanEstudioDetalle().getMateria().getNombreMateria(),
                cargaAcademica.getPlanEstudioDetalle().getMateria().getClaveMateria(),
                cargaAcademica.getGrupo().getIdGrupo(),
                cargaAcademica.getGrupo().getClaveGrupo(),
                cargaAcademica.getGrupo().getTurno().name(),
                cargaAcademica.getGrupo().getSemestre(),
                cargaAcademica.getProfesor().getIdProfesor(),
                nombreProfesor,
                cargaAcademica.getProfesor().getAreaConocimiento(),
                cargaAcademica.getPeriodoAcademico().getIdPeriodoAcademico(),
                cargaAcademica.getPeriodoAcademico().getDescripcion()
        );
    }
}
