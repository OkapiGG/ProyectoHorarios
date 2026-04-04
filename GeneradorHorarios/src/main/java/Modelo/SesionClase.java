package Modelo;

import Modelo.enums.EstadoSesion;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sesion_clase",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"id_aula","id_bloque_tiempo"}),
        }
)
@Data @NoArgsConstructor @AllArgsConstructor
public class SesionClase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sesion")
    private Long idSesion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_componente", nullable = false)
    private ComponenteCarga componenteCarga;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_bloque_tiempo", nullable = false)
    private BloqueTiempo bloqueTiempo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_aula", nullable = false)
    private Aula aula;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoSesion estado = EstadoSesion.PROGRAMADA;
}
