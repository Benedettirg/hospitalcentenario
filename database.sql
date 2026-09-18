-- Hospital Centenario V9 - esquema mínimo para producción.
CREATE DATABASE IF NOT EXISTS hospital_centenario CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hospital_centenario;

CREATE TABLE IF NOT EXISTS solicitudes_turno (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  telefono VARCHAR(40) NOT NULL,
  especialidad VARCHAR(120) NOT NULL,
  fecha_preferida DATE NOT NULL,
  franja VARCHAR(40) NULL,
  estado ENUM('pendiente','contactado','confirmado','cancelado') NOT NULL DEFAULT 'pendiente',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_estado_fecha (estado, fecha_preferida)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS consultas_web (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  motivo VARCHAR(80) NOT NULL,
  mensaje TEXT NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_creado (creado_en)
) ENGINE=InnoDB;
