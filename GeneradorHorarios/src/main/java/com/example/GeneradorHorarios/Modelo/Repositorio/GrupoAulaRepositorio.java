package com.example.GeneradorHorarios.Modelo.Repositorio;

import com.example.GeneradorHorarios.Modelo.GrupoAula;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GrupoAulaRepositorio extends JpaRepository<GrupoAula, Long> {
    long countByPeriodoAcademico_IdPeriodoAcademico(Long idPeriodoAcademico);

    List<GrupoAula> findByPeriodoAcademico_IdPeriodoAcademico(Long idPeriodoAcademico);

    Optional<GrupoAula> findByGrupo_IdGrupoAndPeriodoAcademico_IdPeriodoAcademico(
            Long idGrupo,
            Long idPeriodoAcademico
    );
}
