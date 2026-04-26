package com.example.GeneradorHorarios.Modelo.DTO;

import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.Data;

@Data
public class PlanEstudioDetalleRequest {
    private Long idPlanEstudio;
    private Long idMateria;
    private Integer semestre;
    private Integer horasTeoria;
    private Integer horasLaboratorio;
}
