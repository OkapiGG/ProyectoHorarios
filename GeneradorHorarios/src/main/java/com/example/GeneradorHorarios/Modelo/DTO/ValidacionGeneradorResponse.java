package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ValidacionGeneradorResponse {
    private Boolean listoParaGenerar;
    private Long idPeriodoAcademico;
    private String descripcionPeriodo;
    private Integer totalBloquesTiempo;
    private Integer totalAulas;
    private Integer totalCargasAcademicas;
    private Integer totalComponentesCarga;
    private Integer totalPropuestasAprobadas;
    private Integer totalGruposConAula;
    private Integer cargasSinComponentes;
    private List<String> errores;
    private List<String> advertencias;
}
