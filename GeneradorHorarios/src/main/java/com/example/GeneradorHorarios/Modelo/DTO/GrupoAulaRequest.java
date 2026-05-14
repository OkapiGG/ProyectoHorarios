package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.Data;

@Data
public class GrupoAulaRequest {
    private Long idGrupo;
    private Long idAula;
    private Long idPeriodoAcademico;
}
