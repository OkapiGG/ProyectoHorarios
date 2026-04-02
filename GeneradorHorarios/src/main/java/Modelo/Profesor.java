package Modelo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profesor")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Profesor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_profesor")
    private Long idProfesor;

    @Column(name = "correo")
    private String correo;

    @Column(name = "area_conocimiento")
    private String areaConocimiento;

    @Column(name = "tipo_contrato")
    private String tipoContrato;

    @Column(name = "nom_profesor")
    private String nomProfesor;

    @Column(name = "ap_paterno")
    private String apPaternoProfesor;

    @Column(name = "ap_materno")
    private String apMaternoProfesor;

    @Column(name = "anios_antiguedad")
    private Integer aniosAntiguedad;

    @Column(name = "max_grados_estudios")
    private String maximoGradosEstudios;
}