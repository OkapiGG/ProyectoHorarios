package Modelo;


import Modelo.enums.TipoBloque;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "detalle_horario",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"id_pro_disponibilidad","id_bloque_tiempo"}
        )
)
@Data @NoArgsConstructor @AllArgsConstructor
public class DetalleHorario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_horario")
    private Long idDetalleHorario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pro_disponibilidad", nullable = false)
    private PropuestaDisponibilidad propuestaDisponibilidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_bloque_tiempo", nullable = false)
    private BloqueTiempo bloqueTiempo;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_bloque", nullable = false)
    private TipoBloque tipoBloque;
}
