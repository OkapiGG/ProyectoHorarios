package com.example.GeneradorHorarios.Modelo.Repositorio;

import com.example.GeneradorHorarios.Modelo.CargaAcademica;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CargaAcademicaRepositorio extends JpaRepository<CargaAcademica, Long> {
    List<CargaAcademica> findByProfesor_IdProfesorAndPeriodoAcademico_IdPeriodoAcademico(
            Long idProfesor,
            Long idPeriodoAcademico
    );

    List<CargaAcademica> findByPeriodoAcademico_IdPeriodoAcademico(Long idPeriodoAcademico);

    boolean existsByPlanEstudioDetalle_IdPlanDetalleAndGrupo_IdGrupoAndPeriodoAcademico_IdPeriodoAcademico(
            Long idPlanDetalle,
            Long idGrupo,
            Long idPeriodoAcademico
    );
}
