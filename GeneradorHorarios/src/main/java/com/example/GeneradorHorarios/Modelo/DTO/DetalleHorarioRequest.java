package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.Data;

@Data
public class DetalleHorarioRequest {
        private Long idProDisponibilidad;
        private Long idBloqueTiempo;
        private String tipoBloque;
}
