package Modelo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "CargaAcademica")
@Data
@NoArgsConstructor
@AllArgsConstructor


public class CargaAcademica {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    @Column(name = "idCargaAcademica")
    private Integer idCargaAcademica;

    @ManyToOne
    @JoinColumn(name = "idPlanDetalle")
    private PlanEstudioDetalle planEstudioDetalle;

    @ManyToOne
    @JoinColumn(name = "idGrupo")
    private Grupo grupo;

    @ManyToOne
    @JoinColumn(name = "id_profesor")
    private Profesor profesor;

    @ManyToOne
    @JoinColumn(name = "idPeriodoAcademico")
    private PeriodoAcademico periodoAcademico;


}
