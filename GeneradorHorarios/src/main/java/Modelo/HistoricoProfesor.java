package Modelo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "historico_profesor")
@Data @NoArgsConstructor @AllArgsConstructor
public class HistoricoProfesor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historico_profesor")
    private Long idHistoricoProfesor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_profesor", nullable = false)
    private Profesor profesor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_periodo_academico", nullable = false)
    private PeriodoAcademico periodoAcademico;

    @Column(name = "evaluacion_docente")
    private Double evaluacionDocente;

    @Column(name = "indice_aprobacion")
    private Double indiceAprobacion;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

}
