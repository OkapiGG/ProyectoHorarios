package Modelo;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "carga_academica")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CargaAcademica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_carga_academica")
    private Long idCargaAcademica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_plan_detalle", nullable = false)
    private PlanEstudioDetalle planEstudioDetalle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_grupo", nullable = false)
    private Grupo grupo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_profesor", nullable = false)
    private Profesor profesor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_periodo_academico", nullable = false)
    private PeriodoAcademico periodoAcademico;
}

