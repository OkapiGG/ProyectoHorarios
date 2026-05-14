package com.example.GeneradorHorarios.Modelo.DTO;

import com.example.GeneradorHorarios.Modelo.GrupoAula;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GrupoAulaResponse {
    private Long idGrupoAula;
    private Long idGrupo;
    private String claveGrupo;
    private Integer semestreGrupo;
    private String turnoGrupo;
    private Long idAula;
    private String nombreAula;
    private Integer capacidadAula;
    private String tipoAula;
    private Long idPeriodoAcademico;
    private String descripcionPeriodo;

    public static GrupoAulaResponse fromEntity(GrupoAula grupoAula) {
        return new GrupoAulaResponse(
                grupoAula.getIdGrupoAula(),
                grupoAula.getGrupo().getIdGrupo(),
                grupoAula.getGrupo().getClaveGrupo(),
                grupoAula.getGrupo().getSemestre(),
                grupoAula.getGrupo().getTurno().name(),
                grupoAula.getAula().getIdAula(),
                grupoAula.getAula().getNombreAula(),
                grupoAula.getAula().getCapacidad(),
                grupoAula.getAula().getTipoAula().name(),
                grupoAula.getPeriodoAcademico().getIdPeriodoAcademico(),
                grupoAula.getPeriodoAcademico().getDescripcion()
        );
    }
}
