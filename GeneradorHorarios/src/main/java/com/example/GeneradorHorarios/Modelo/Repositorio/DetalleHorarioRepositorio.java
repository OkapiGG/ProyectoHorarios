package com.example.GeneradorHorarios.Modelo.Repositorio;

import com.example.GeneradorHorarios.Modelo.DetalleHorario;
import com.example.GeneradorHorarios.Modelo.PropuestaDisponibilidad;
import com.example.GeneradorHorarios.Modelo.enums.TipoBloque;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DetalleHorarioRepositorio extends JpaRepository<DetalleHorario, Long> {
    List<DetalleHorario> findByPropuestaDisponibilidad_IdProDisponibilidad(Long idProDisponibilidad);
    List<DetalleHorario> findByPropuestaDisponibilidadIn(List<PropuestaDisponibilidad> propuestasDisponibilidad);
    Optional<DetalleHorario> findByPropuestaDisponibilidad_IdProDisponibilidadAndBloqueTiempo_IdBloqueTiempo(
            Long idProDisponibilidad,
            Long idBloqueTiempo
    );
    long countByPropuestaDisponibilidad_IdProDisponibilidadAndTipoBloque(
            Long idProDisponibilidad,
            TipoBloque tipoBloque
    );
}
