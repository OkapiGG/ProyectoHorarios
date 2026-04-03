package Modelo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "PlanEstudioDetalle")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class PlanEstudioDetalle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idPlanEstudioDetalle")
    private Integer idPlanEstudioDetalle;

    @OneToMany(mappedBy = "planEstudioDetalle")
    private List<CargaAcademica> cargasAcademicas;

    @ManyToOne
    @JoinColumn(name = "idPlanEstudio")
    private PlanEstudio planEstudio;

   @ManyToOne
    @JoinColumn(name = "id_materia")
    private Materia materia;

   @Column(name = "semestre")
    private String semestre;

   @Column(name = "horasTeoria")
    private Integer horasTeoria;

   @Column(name = "horasLaboratorio")
    private Integer horasLaboratorio;

}
