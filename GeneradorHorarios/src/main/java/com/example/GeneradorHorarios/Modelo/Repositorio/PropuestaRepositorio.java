package com.example.GeneradorHorarios.Modelo.Repositorio;

import com.example.GeneradorHorarios.Modelo.PropuestaDisponibilidad;
import com.example.GeneradorHorarios.Modelo.enums.EstadoPropuesta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PropuestaRepositorio extends JpaRepository<PropuestaDisponibilidad, Long> {

    Optional<PropuestaDisponibilidad> findByProfesor_IdProfesorAndPeriodoAcademico_IdPeriodoAcademico(
            Long idProfesor,
            Long idPeriodoAcademico
    );

    List<PropuestaDisponibilidad> findByProfesor_IdProfesor(Long idProfesor);
    List<PropuestaDisponibilidad> findByProfesor_IdProfesorAndEstado(Long idProfesor, EstadoPropuesta estadoPropuesta);
    List<PropuestaDisponibilidad> findByEstado(EstadoPropuesta estadoPropuesta);
    List<PropuestaDisponibilidad> findByEstadoAndPeriodoAcademico_IdPeriodoAcademico(
            EstadoPropuesta estadoPropuesta,
            Long idPeriodoAcademico
    );

    long countByEstadoAndPeriodoAcademico_IdPeriodoAcademico(
            EstadoPropuesta estadoPropuesta,
            Long idPeriodoAcademico
    );
}
