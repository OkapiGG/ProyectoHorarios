package com.example.GeneradorHorarios.Servicio;

import com.example.GeneradorHorarios.Modelo.DTO.HorarioGeneradoSesionResponse;
import com.example.GeneradorHorarios.Modelo.SesionClase;
import com.example.GeneradorHorarios.Modelo.Repositorio.SesionClaseRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class HorarioGeneradoConsultaService {

    @Autowired
    private SesionClaseRepositorio sesionClaseRepositorio;

    public List<HorarioGeneradoSesionResponse> listarPorPeriodo(Long idPeriodoAcademico) {
        List<SesionClase> sesiones = sesionClaseRepositorio
                .findDetalleByPeriodoAcademico(idPeriodoAcademico);

        Map<String, AgregadorSesion> agregadas = new LinkedHashMap<>();

        for (SesionClase sesion : sesiones) {
            String claveSesion = construirClaveSesion(sesion);
            AgregadorSesion actual = agregadas.computeIfAbsent(
                    claveSesion,
                    clave -> new AgregadorSesion(clave, sesion)
            );

            actual.registrarBloque(sesion);
        }

        List<HorarioGeneradoSesionResponse> response = new ArrayList<>();
        for (AgregadorSesion agregada : agregadas.values()) {
            response.add(agregada.toResponse());
        }

        return response;
    }

    private String construirClaveSesion(SesionClase sesion) {
        return sesion.getComponenteCarga().getIdComponente() + "-" + sesion.getNumeroSesion();
    }

    private String construirNombreProfesor(SesionClase sesion) {
        List<String> partes = new ArrayList<>();

        if (sesion.getComponenteCarga().getCargaAcademica().getProfesor().getNomProfesor() != null) {
            partes.add(sesion.getComponenteCarga().getCargaAcademica().getProfesor().getNomProfesor().trim());
        }
        if (sesion.getComponenteCarga().getCargaAcademica().getProfesor().getApPaternoProfesor() != null) {
            partes.add(sesion.getComponenteCarga().getCargaAcademica().getProfesor().getApPaternoProfesor().trim());
        }
        if (sesion.getComponenteCarga().getCargaAcademica().getProfesor().getApMaternoProfesor() != null) {
            partes.add(sesion.getComponenteCarga().getCargaAcademica().getProfesor().getApMaternoProfesor().trim());
        }

        return String.join(" ", partes).trim();
    }

    private class AgregadorSesion {
        private final String claveSesion;
        private final SesionClase base;
        private LocalTime horaInicio;
        private LocalTime horaFin;
        private int bloques = 0;

        private AgregadorSesion(String claveSesion, SesionClase base) {
            this.claveSesion = claveSesion;
            this.base = base;
        }

        private void registrarBloque(SesionClase sesion) {
            LocalTime inicioBloque = sesion.getBloqueTiempo().getHoraInicio();
            LocalTime finBloque = sesion.getBloqueTiempo().getHoraFin();

            if (horaInicio == null || inicioBloque.isBefore(horaInicio)) {
                horaInicio = inicioBloque;
            }

            if (horaFin == null || finBloque.isAfter(horaFin)) {
                horaFin = finBloque;
            }

            bloques += 1;
        }

        private HorarioGeneradoSesionResponse toResponse() {
            int duracionHoras = (int) ChronoUnit.HOURS.between(horaInicio, horaFin);
            if (duracionHoras <= 0) {
                duracionHoras = bloques;
            }

            return new HorarioGeneradoSesionResponse(
                    claveSesion,
                    base.getComponenteCarga().getIdComponente(),
                    base.getNumeroSesion(),
                    base.getEstado().name(),
                    base.getComponenteCarga().getCargaAcademica().getPeriodoAcademico().getIdPeriodoAcademico(),
                    base.getComponenteCarga().getCargaAcademica().getGrupo().getIdGrupo(),
                    base.getComponenteCarga().getCargaAcademica().getGrupo().getClaveGrupo(),
                    base.getComponenteCarga().getCargaAcademica().getGrupo().getSemestre(),
                    base.getComponenteCarga().getCargaAcademica().getGrupo().getTurno().name(),
                    base.getComponenteCarga().getCargaAcademica().getGrupo().getCupoMaximo(),
                    base.getComponenteCarga().getCargaAcademica().getProfesor().getIdProfesor(),
                    construirNombreProfesor(base),
                    base.getAula().getIdAula(),
                    base.getAula().getNombreAula(),
                    base.getAula().getTipoAula().name(),
                    base.getComponenteCarga().getCargaAcademica().getPlanEstudioDetalle().getMateria().getIdMateria(),
                    base.getComponenteCarga().getCargaAcademica().getPlanEstudioDetalle().getMateria().getClaveMateria(),
                    base.getComponenteCarga().getCargaAcademica().getPlanEstudioDetalle().getMateria().getNombreMateria(),
                    base.getComponenteCarga().getTipoSesion().name(),
                    base.getBloqueTiempo().getDiaSemana(),
                    horaInicio.toString(),
                    horaFin.toString(),
                    duracionHoras
            );
        }
    }
}
