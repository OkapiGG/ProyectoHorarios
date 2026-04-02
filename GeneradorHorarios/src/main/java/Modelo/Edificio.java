package Modelo;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "edificio")
@Getter
@Setter @NoArgsConstructor @AllArgsConstructor
public class Edificio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_edificio")
    private Long idEdificio;

    @Column(name = "nombre_edificio", nullable = false)
    private String nombreEdificio;
}
