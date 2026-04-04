package Modelo;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "materia")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Materia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_materia")
    private Long idMateria;

    @Column(name = "clave_materia", nullable = false, unique = true)
    private String claveMateria;

    @Column(name = "nombre_materia", nullable = false)
    private String nombreMateria;

    @Column(nullable = false)
    private Integer creditos;

    @Column(name = "horas_semanales", nullable = false)
    private Integer horasSemanales;

}
