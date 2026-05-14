package com.example.GeneradorHorarios.Modelo.DTO;

import com.example.GeneradorHorarios.Modelo.Aula;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AulaResponse {
    private Long idAula;
    private String nombreAula;
    private Integer capacidad;
    private String tipoAula;
    private Long idEdificio;
    private String nombreEdificio;

    public static AulaResponse fromEntity(Aula aula) {
        return new AulaResponse(
                aula.getIdAula(),
                aula.getNombreAula(),
                aula.getCapacidad(),
                aula.getTipoAula().name(),
                aula.getEdificio().getIdEdificio(),
                aula.getEdificio().getNombreEdificio()
        );
    }
}
