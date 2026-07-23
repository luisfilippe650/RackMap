CREATE DATABASE rackmap
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE rackmap;

-- ===========================================
-- MAPAS
-- ===========================================

CREATE TABLE maps (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),

    columns_count INT NOT NULL,
    rows_count INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- ===========================================
-- LOCALIDADES
-- Ex:
-- AA
-- AB
-- AC
-- BA
-- BB
-- ===========================================

CREATE TABLE map_locations (

    id INT AUTO_INCREMENT PRIMARY KEY,

    map_id INT NOT NULL,

    code VARCHAR(10) NOT NULL,

    description VARCHAR(100),

    FOREIGN KEY (map_id)
        REFERENCES maps(id)
        ON DELETE CASCADE,

    UNIQUE(map_id, code)

);

-- ===========================================
-- POSIÇÕES DOS RACKS
--
-- Aqui o usuário define:
--
-- AB + 2 = x4 y3
--
-- BA + 10 = x7 y8
--
-- etc...
-- ===========================================

CREATE TABLE map_positions (

    id INT AUTO_INCREMENT PRIMARY KEY,

    map_id INT NOT NULL,

    location_id INT NOT NULL,

    rack_number VARCHAR(20) NOT NULL,

    position_x INT NOT NULL,

    position_y INT NOT NULL,

    FOREIGN KEY (map_id)
        REFERENCES maps(id)
        ON DELETE CASCADE,

    FOREIGN KEY (location_id)
        REFERENCES map_locations(id)
        ON DELETE CASCADE,

    UNIQUE(map_id, location_id, rack_number),

    UNIQUE(map_id, position_x, position_y)

);

-- ===========================================
-- ELEMENTOS FIXOS DO MAPA
--
-- parede
-- porta
-- pdu
--
-- NÃO salva rack aqui.
-- Rack será desenhado automaticamente.
-- ===========================================

CREATE TABLE map_elements (

    id INT AUTO_INCREMENT PRIMARY KEY,

    map_id INT NOT NULL,

    type ENUM(
        'WALL',
        'DOOR',
        'PDU'
    ) NOT NULL,

    label VARCHAR(100),

    position_x INT NOT NULL,

    position_y INT NOT NULL,

    rotation INT DEFAULT 0,

    FOREIGN KEY (map_id)
        REFERENCES maps(id)
        ON DELETE CASCADE,

    UNIQUE(map_id, position_x, position_y)

);