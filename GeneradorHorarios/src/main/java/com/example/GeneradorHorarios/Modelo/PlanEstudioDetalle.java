package com.example.GeneradorHorarios.Modelo;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "plan_estudio_detalle")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PlanEstudioDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_plan_detalle")
    private Long idPlanDetalle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_plan_estudio", nullable = false)
    private PlanEstudio planEstudio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_materia", nullable = false)
    private Materia materia;

    @Column(nullable = false)
    private Integer semestre;

    @Column(name = "horas_teoria", nullable = false)
    private Integer horasTeoria;

    @Column(name = "horas_laboratorio", nullable = false)
    private Integer horasLaboratorio;
}
