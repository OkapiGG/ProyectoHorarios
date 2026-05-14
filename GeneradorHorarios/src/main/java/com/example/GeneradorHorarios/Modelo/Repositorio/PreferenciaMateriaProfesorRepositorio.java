package com.example.GeneradorHorarios.Modelo.Repositorio;

import com.example.GeneradorHorarios.Modelo.PreferenciaMateriaProfesor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PreferenciaMateriaProfesorRepositorio extends JpaRepository<PreferenciaMateriaProfesor, Long> {
    List<PreferenciaMateriaProfesor> findByProfesor_IdProfesor(Long idProfesor);
    List<PreferenciaMateriaProfesor> findByPeriodoAcademico_IdPeriodoAcademico(Long idPeriodoAcademico);

    List<PreferenciaMateriaProfesor> findByProfesor_IdProfesorAndPeriodoAcademico_IdPeriodoAcademico(
            Long idProfesor,
            Long idPeriodoAcademico
    );

    Optional<PreferenciaMateriaProfesor> findByProfesor_IdProfesorAndMateria_IdMateriaAndPeriodoAcademico_IdPeriodoAcademico(
            Long idProfesor,
            Long idMateria,
            Long idPeriodoAcademico
    );
}
