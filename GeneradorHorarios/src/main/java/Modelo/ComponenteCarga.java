package Modelo;

import Modelo.enums.TipoSesion;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "componente_carga")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ComponenteCarga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_componente")
    private Long idComponente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_carga_academica", nullable = false)
    private CargaAcademica cargaAcademica;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_sesion", nullable = false)
    private TipoSesion tipoSesion;

    @Column(name = "num_sesiones", nullable = false)
    private Integer numSesiones;

    @Column(name = "bloques_por_sesion", nullable = false)
    private Integer bloquesPorSesion;

    @Column(name = "requiere_consecutivos", nullable = false)
    private Boolean requiereConsecutivos = false;
}
