package Modelo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "planEstudio")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanEstudio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_planEstudio")
    private Long idPlanEstudio;

    @ManyToOne
    @JoinColumn(name = "id_carrera")
    private Carrera Carrera;

    @OneToMany(mappedBy = "planEstudio")
    private List<PlanEstudioDetalle> planEstudioDetalles;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "vigencia_inicio")
    private Integer vigenciainicio;

    @Column(name = "vigencia_fin")
    private Integer vigenciaFin;

    @Column(name = "activo")
    private Boolean activo;
}
