-- Crear usuario y otorgar privilegios
CREATE USER IF NOT EXISTS 'Admin'@'%' IDENTIFIED BY 'Admin';
GRANT ALL PRIVILEGES ON deportes.* TO 'Admin'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- Crear Base de Datos
CREATE DATABASE IF NOT EXISTS deportes;
USE deportes;

-- Tabla: Torneos
CREATE TABLE IF NOT EXISTS Torneos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(255) NOT NULL,
    Deporte VARCHAR(255) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL
);

-- Tabla: Equipos
CREATE TABLE IF NOT EXISTS Equipos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(255) NOT NULL,
    Torneo_id BIGINT UNSIGNED NOT NULL,
    Grupo VARCHAR(50) DEFAULT NULL, 
    Anotaciones_a INT DEFAULT 0,
    Anotaciones_r INT DEFAULT 0,
    Anotaciones_d INT DEFAULT 0,
    Victorias INT DEFAULT 0,
    Derrotas INT DEFAULT 0,
    Empates INT DEFAULT 0,
    Puntos INT DEFAULT 0,
    FOREIGN KEY (Torneo_id) REFERENCES Torneos(id)
);

-- Tabla: Jugadores
CREATE TABLE IF NOT EXISTS Jugadores (
    carnet BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    equipo_id BIGINT UNSIGNED NOT NULL,
    numero INT NOT NULL,
    anotaciones INT DEFAULT 0,
    FOREIGN KEY (equipo_id) REFERENCES Equipos(id)
);

-- Tabla: HistorialMejoresEquipos
CREATE TABLE IF NOT EXISTS HistorialMejoresEquipos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    equipo_id BIGINT UNSIGNED NOT NULL,
    semana DATE NOT NULL,
    FOREIGN KEY (equipo_id) REFERENCES Equipos(id)
);

-- Tabla: Partidos
CREATE TABLE IF NOT EXISTS Partidos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    torneo_id BIGINT UNSIGNED NOT NULL,
    Local BIGINT UNSIGNED NOT NULL,
    Visitante BIGINT UNSIGNED NOT NULL,
    Anotaciones_local INT DEFAULT 0,
    Anotaciones_visitante INT DEFAULT 0,
    ubicacion VARCHAR(255) NOT NULL,
    Fecha DATE NOT NULL,
    Estado VARCHAR(255) NOT NULL,
    FOREIGN KEY (torneo_id) REFERENCES Torneos(id),
    FOREIGN KEY (Local) REFERENCES Equipos(id),
    FOREIGN KEY (Visitante) REFERENCES Equipos(id)
);

-- Tabla: Relación Torneos-Equipos
CREATE TABLE IF NOT EXISTS torneo_has_equipos (
    torneo_id BIGINT UNSIGNED NOT NULL,
    equipo_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (torneo_id, equipo_id),
    FOREIGN KEY (torneo_id) REFERENCES Torneos(id),
    FOREIGN KEY (equipo_id) REFERENCES Equipos(id)
);
