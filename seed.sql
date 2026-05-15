-- ============================================================
-- SEED SIGHO — Limpieza + datos base para prueba completa
-- ============================================================

-- 1. LIMPIAR TODO (CASCADE maneja el orden de FK)
TRUNCATE TABLE
  sesion_clase,
  conflicto_generacion,
  detalle_horario,
  historico_profesor,
  preferencia_materia_profesor,
  componente_carga,
  carga_academica,
  grupo_aula,
  propuesta_disponibilidad,
  usuario,
  plan_estudio_detalle,
  plan_estudio,
  grupo,
  carrera,
  aula,
  edificio,
  materia,
  profesor,
  periodo_academico,
  bloque_tiempo
RESTART IDENTITY CASCADE;

-- ============================================================
-- 2. PERIODO ACADÉMICO (exactamente 1 activo)
-- ============================================================
INSERT INTO periodo_academico (descripcion, anio, fecha_inicio, fecha_fin, activo) VALUES
  ('Ciclo 2026-A', 2026, '2026-01-15', '2026-06-20', true);

-- ============================================================
-- 3. BLOQUES DE TIEMPO
--    MATUTINO : Lun-Vie  07:00-13:00  (6 slots × 5 días = 30)
--    VESPERTINO: Lun-Vie 13:00-18:00  (5 slots × 5 días = 25)
-- ============================================================
INSERT INTO bloque_tiempo (dia_semana, hora_inicio, hora_fin, turno) VALUES
  -- LUNES MATUTINO
  ('LUNES',    '07:00', '08:00', 'MATUTINO'),
  ('LUNES',    '08:00', '09:00', 'MATUTINO'),
  ('LUNES',    '09:00', '10:00', 'MATUTINO'),
  ('LUNES',    '10:00', '11:00', 'MATUTINO'),
  ('LUNES',    '11:00', '12:00', 'MATUTINO'),
  ('LUNES',    '12:00', '13:00', 'MATUTINO'),
  -- MARTES MATUTINO
  ('MARTES',   '07:00', '08:00', 'MATUTINO'),
  ('MARTES',   '08:00', '09:00', 'MATUTINO'),
  ('MARTES',   '09:00', '10:00', 'MATUTINO'),
  ('MARTES',   '10:00', '11:00', 'MATUTINO'),
  ('MARTES',   '11:00', '12:00', 'MATUTINO'),
  ('MARTES',   '12:00', '13:00', 'MATUTINO'),
  -- MIÉRCOLES MATUTINO
  ('MIERCOLES','07:00', '08:00', 'MATUTINO'),
  ('MIERCOLES','08:00', '09:00', 'MATUTINO'),
  ('MIERCOLES','09:00', '10:00', 'MATUTINO'),
  ('MIERCOLES','10:00', '11:00', 'MATUTINO'),
  ('MIERCOLES','11:00', '12:00', 'MATUTINO'),
  ('MIERCOLES','12:00', '13:00', 'MATUTINO'),
  -- JUEVES MATUTINO
  ('JUEVES',   '07:00', '08:00', 'MATUTINO'),
  ('JUEVES',   '08:00', '09:00', 'MATUTINO'),
  ('JUEVES',   '09:00', '10:00', 'MATUTINO'),
  ('JUEVES',   '10:00', '11:00', 'MATUTINO'),
  ('JUEVES',   '11:00', '12:00', 'MATUTINO'),
  ('JUEVES',   '12:00', '13:00', 'MATUTINO'),
  -- VIERNES MATUTINO
  ('VIERNES',  '07:00', '08:00', 'MATUTINO'),
  ('VIERNES',  '08:00', '09:00', 'MATUTINO'),
  ('VIERNES',  '09:00', '10:00', 'MATUTINO'),
  ('VIERNES',  '10:00', '11:00', 'MATUTINO'),
  ('VIERNES',  '11:00', '12:00', 'MATUTINO'),
  ('VIERNES',  '12:00', '13:00', 'MATUTINO'),
  -- LUNES VESPERTINO (15:00-21:00 para coincidir con la vista del frontend)
  ('LUNES',    '15:00', '16:00', 'VESPERTINO'),
  ('LUNES',    '16:00', '17:00', 'VESPERTINO'),
  ('LUNES',    '17:00', '18:00', 'VESPERTINO'),
  ('LUNES',    '18:00', '19:00', 'VESPERTINO'),
  ('LUNES',    '19:00', '20:00', 'VESPERTINO'),
  ('LUNES',    '20:00', '21:00', 'VESPERTINO'),
  -- MARTES VESPERTINO
  ('MARTES',   '15:00', '16:00', 'VESPERTINO'),
  ('MARTES',   '16:00', '17:00', 'VESPERTINO'),
  ('MARTES',   '17:00', '18:00', 'VESPERTINO'),
  ('MARTES',   '18:00', '19:00', 'VESPERTINO'),
  ('MARTES',   '19:00', '20:00', 'VESPERTINO'),
  ('MARTES',   '20:00', '21:00', 'VESPERTINO'),
  -- MIÉRCOLES VESPERTINO
  ('MIERCOLES','15:00', '16:00', 'VESPERTINO'),
  ('MIERCOLES','16:00', '17:00', 'VESPERTINO'),
  ('MIERCOLES','17:00', '18:00', 'VESPERTINO'),
  ('MIERCOLES','18:00', '19:00', 'VESPERTINO'),
  ('MIERCOLES','19:00', '20:00', 'VESPERTINO'),
  ('MIERCOLES','20:00', '21:00', 'VESPERTINO'),
  -- JUEVES VESPERTINO
  ('JUEVES',   '15:00', '16:00', 'VESPERTINO'),
  ('JUEVES',   '16:00', '17:00', 'VESPERTINO'),
  ('JUEVES',   '17:00', '18:00', 'VESPERTINO'),
  ('JUEVES',   '18:00', '19:00', 'VESPERTINO'),
  ('JUEVES',   '19:00', '20:00', 'VESPERTINO'),
  ('JUEVES',   '20:00', '21:00', 'VESPERTINO'),
  -- VIERNES VESPERTINO
  ('VIERNES',  '15:00', '16:00', 'VESPERTINO'),
  ('VIERNES',  '16:00', '17:00', 'VESPERTINO'),
  ('VIERNES',  '17:00', '18:00', 'VESPERTINO'),
  ('VIERNES',  '18:00', '19:00', 'VESPERTINO'),
  ('VIERNES',  '19:00', '20:00', 'VESPERTINO'),
  ('VIERNES',  '20:00', '21:00', 'VESPERTINO');

-- ============================================================
-- 4. EDIFICIO Y AULAS
-- ============================================================
INSERT INTO edificio (nombre_edificio) VALUES
  ('Edificio A'),
  ('Edificio B');

-- Regla del generador: aula.capacidad >= grupo.cupo_maximo
-- Grupos más grandes tienen 35 alumnos → labs deben tener >= 35
INSERT INTO aula (nombre_aula, capacidad, tipo_aula, id_edificio) VALUES
  ('A-101', 40, 'NORMAL',      1),
  ('A-102', 40, 'NORMAL',      1),
  ('A-201', 40, 'LABORATORIO', 1),
  ('B-101', 35, 'NORMAL',      2),
  ('B-102', 35, 'NORMAL',      2),
  ('B-201', 40, 'LABORATORIO', 2);

-- ============================================================
-- 5. CARRERA, MATERIAS, PLAN DE ESTUDIO
-- ============================================================
INSERT INTO carrera (nombre_carrera) VALUES
  ('Ingeniería en Sistemas Computacionales'),
  ('Licenciatura en Contaduría');

INSERT INTO materia (clave_materia, nombre_materia, creditos, horas_semanales) VALUES
  ('ISC-101', 'Fundamentos de Programación',  8, 4),
  ('ISC-102', 'Cálculo Diferencial',          8, 4),
  ('ISC-103', 'Álgebra Lineal',               6, 3),
  ('ISC-201', 'Estructura de Datos',          8, 4),
  ('LCO-101', 'Contabilidad Básica',          8, 4),
  ('LCO-102', 'Matemáticas Financieras',      6, 3);

-- Plan de estudio ISC (id_plan_estudio = 1)
INSERT INTO plan_estudio (descripcion, activo, vigencia_inicio, vigencia_fin, id_carrera) VALUES
  ('Plan ISC 2020', true, '2020-01-01', '2025-12-31', 1),
  ('Plan LCO 2020', true, '2020-01-01', '2025-12-31', 2);

-- Detalles: materia → plan, semestre, horas
INSERT INTO plan_estudio_detalle (id_plan_estudio, id_materia, semestre, horas_teoria, horas_laboratorio) VALUES
  (1, 1, 1, 3, 1),   -- ISC sem1: Fundamentos de Programación
  (1, 2, 1, 4, 0),   -- ISC sem1: Cálculo Diferencial
  (1, 3, 1, 3, 0),   -- ISC sem1: Álgebra Lineal
  (1, 4, 2, 3, 1),   -- ISC sem2: Estructura de Datos
  (2, 5, 1, 4, 0),   -- LCO sem1: Contabilidad Básica
  (2, 6, 1, 3, 0);   -- LCO sem1: Matemáticas Financieras

-- ============================================================
-- 6. GRUPOS
-- ============================================================
INSERT INTO grupo (clave_grupo, semestre, cupo_maximo, turno, id_carrera) VALUES
  ('ISC-1A', 1, 35, 'MATUTINO',   1),
  ('ISC-1B', 1, 35, 'VESPERTINO', 1),
  ('LCO-1A', 1, 30, 'MATUTINO',   2),
  ('LCO-1B', 1, 30, 'VESPERTINO', 2);

-- ============================================================
-- 7. GRUPO-AULA (asignación de aula base por periodo)
-- ============================================================
INSERT INTO grupo_aula (id_grupo, id_aula, id_periodo_academico) VALUES
  (1, 1, 1),  -- ISC-1A → A-101
  (2, 2, 1),  -- ISC-1B → A-102
  (3, 4, 1),  -- LCO-1A → B-101
  (4, 5, 1);  -- LCO-1B → B-102

-- ============================================================
-- 8. PROFESORES
-- ============================================================
INSERT INTO profesor (nom_profesor, ap_paterno_profesor, ap_materno_profesor, correo, area_conocimiento, tipo_contrato, max_grado_estudios, anios_antiguedad) VALUES
  ('Carlos',   'Mendoza',  'Ríos',    'carlos.mendoza@unach.mx',   'Programación',   'TIEMPO_COMPLETO', 'MAESTRIA',   10),
  ('Diana',    'Torres',   'Vega',    'diana.torres@unach.mx',     'Matemáticas',    'TIEMPO_COMPLETO', 'DOCTORADO',  15),
  ('Eduardo',  'Salinas',  'Gómez',   'eduardo.salinas@unach.mx',  'Contabilidad',   'MEDIO_TIEMPO',    'MAESTRIA',    5);

-- ============================================================
-- 9. USUARIOS
--    Contraseñas en texto plano (sistema actual sin hashing)
--    COORDINADOR no lleva id_profesor
-- ============================================================
INSERT INTO usuario (correo, password_hash, rol, activo, id_profesor) VALUES
  ('coordinador@unach.mx', 'admin123',   'COORDINADOR', true, NULL),
  ('carlos@unach.mx',      'prof123',    'PROFESOR',    true, 1),
  ('diana@unach.mx',       'prof123',    'PROFESOR',    true, 2),
  ('eduardo@unach.mx',     'prof123',    'PROFESOR',    true, 3);

-- ============================================================
-- 10. CARGA ACADÉMICA + COMPONENTES
--     Carlos  → Fundamentos de Programación (ISC-1A y ISC-1B)
--     Diana   → Cálculo Diferencial (ISC-1A), Álgebra Lineal (ISC-1A)
--     Eduardo → Contabilidad Básica (LCO-1A y LCO-1B)
-- ============================================================
INSERT INTO carga_academica (id_profesor, id_grupo, id_plan_detalle, id_periodo_academico) VALUES
  -- Carlos: Fundamentos de Programación
  (1, 1, 1, 1),  -- ISC-1A  → id_carga=1
  (1, 2, 1, 1),  -- ISC-1B  → id_carga=2
  -- Diana: Cálculo Diferencial + Álgebra Lineal en ISC-1A
  (2, 1, 2, 1),  -- ISC-1A Cálculo → id_carga=3
  (2, 1, 3, 1),  -- ISC-1A Álgebra → id_carga=4
  -- Eduardo: Contabilidad Básica
  (3, 3, 5, 1),  -- LCO-1A → id_carga=5
  (3, 4, 5, 1);  -- LCO-1B → id_carga=6

-- Componentes: TEORIA + LABORATORIO donde aplique
INSERT INTO componente_carga (id_carga_academica, tipo_sesion, num_sesiones, bloques_por_sesion, requiere_consecutivos) VALUES
  -- Fundamentos de Programación (3h teoría + 1h lab)
  (1, 'TEORIA',      3, 1, false),
  (1, 'LABORATORIO', 1, 1, false),
  (2, 'TEORIA',      3, 1, false),
  (2, 'LABORATORIO', 1, 1, false),
  -- Cálculo Diferencial (4h teoría)
  (3, 'TEORIA',      4, 1, false),
  -- Álgebra Lineal (3h teoría)
  (4, 'TEORIA',      3, 1, false),
  -- Contabilidad Básica (4h teoría)
  (5, 'TEORIA',      4, 1, false),
  (6, 'TEORIA',      4, 1, false);

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
SELECT 'periodo_academico'      AS tabla, COUNT(*) FROM periodo_academico      UNION ALL
SELECT 'bloque_tiempo',                   COUNT(*) FROM bloque_tiempo           UNION ALL
SELECT 'edificio',                        COUNT(*) FROM edificio                UNION ALL
SELECT 'aula',                            COUNT(*) FROM aula                    UNION ALL
SELECT 'carrera',                         COUNT(*) FROM carrera                 UNION ALL
SELECT 'materia',                         COUNT(*) FROM materia                 UNION ALL
SELECT 'plan_estudio',                    COUNT(*) FROM plan_estudio            UNION ALL
SELECT 'plan_estudio_detalle',            COUNT(*) FROM plan_estudio_detalle    UNION ALL
SELECT 'grupo',                           COUNT(*) FROM grupo                   UNION ALL
SELECT 'grupo_aula',                      COUNT(*) FROM grupo_aula              UNION ALL
SELECT 'profesor',                        COUNT(*) FROM profesor                UNION ALL
SELECT 'usuario',                         COUNT(*) FROM usuario                 UNION ALL
SELECT 'carga_academica',                 COUNT(*) FROM carga_academica         UNION ALL
SELECT 'componente_carga',                COUNT(*) FROM componente_carga
ORDER BY tabla;
