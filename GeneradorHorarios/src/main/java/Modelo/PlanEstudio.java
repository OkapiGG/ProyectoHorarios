package Modelo;

// aqui lo mismo llaves foraneas

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "planEstudio")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanEstudio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idPlanEstudio")
    private Long idPlanEstudio;
    @Column(name = "descripcion")
    private String descripcion;
    @Column(name = "vigenciainicio")
    private Integer vigenciainicio;
    @Column(name = "vigenciaFin")
    private Integer vigenciaFin;
    @Column(name = "activo")
    private Boolean activo;
}
