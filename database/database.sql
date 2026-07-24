CREATE DATABASE IF NOT EXISTS rackmap
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE rackmap;

-- =========================================================
-- MAPAS
-- =========================================================

CREATE TABLE IF NOT EXISTS datacenter_maps (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,

    width DECIMAL(10, 2) NOT NULL DEFAULT 1200,
    height DECIMAL(10, 2) NOT NULL DEFAULT 800,

    background_color VARCHAR(20) NULL,
    grid_enabled BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_datacenter_maps_name (name)
);

-- =========================================================
-- LOCATIONS DO RACKTABLES ASSOCIADAS AO MAPA
-- =========================================================

CREATE TABLE IF NOT EXISTS map_source_locations (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    map_id INT UNSIGNED NOT NULL,

    external_location_id INT UNSIGNED NOT NULL,
    external_location_name VARCHAR(150) NOT NULL,
    normalized_location_name VARCHAR(150) NOT NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_map_external_location (
        map_id,
        external_location_id
    ),

    KEY idx_source_location_external_id (
        external_location_id
    ),

    CONSTRAINT fk_source_location_map
        FOREIGN KEY (map_id)
        REFERENCES datacenter_maps(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================================
-- COLUNAS VISUAIS
-- =========================================================

CREATE TABLE IF NOT EXISTS map_columns (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    map_id INT UNSIGNED NOT NULL,

    code VARCHAR(30) NOT NULL,
    label VARCHAR(100) NULL,
    sort_order INT NOT NULL,

    width DECIMAL(10, 2) NOT NULL DEFAULT 64,
    visible BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_map_column_code (
        map_id,
        code
    ),

    UNIQUE KEY uq_map_column_order (
        map_id,
        sort_order
    ),

    CONSTRAINT fk_map_column_map
        FOREIGN KEY (map_id)
        REFERENCES datacenter_maps(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================================
-- LINHAS VISUAIS
-- =========================================================

CREATE TABLE IF NOT EXISTS map_rows (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    map_id INT UNSIGNED NOT NULL,

    code VARCHAR(30) NOT NULL,
    label VARCHAR(100) NULL,
    sort_order INT NOT NULL,

    height DECIMAL(10, 2) NOT NULL DEFAULT 32,
    visible BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_map_row_code (
        map_id,
        code
    ),

    UNIQUE KEY uq_map_row_order (
        map_id,
        sort_order
    ),

    CONSTRAINT fk_map_row_map
        FOREIGN KEY (map_id)
        REFERENCES datacenter_maps(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================================
-- POSIÇÕES DINÂMICAS PARA RACKS
-- =========================================================

CREATE TABLE IF NOT EXISTS rack_slots (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    map_id INT UNSIGNED NOT NULL,

    -- Dados usados para comparar com o RackTables
    external_row_id INT UNSIGNED NULL,
    external_row_name VARCHAR(100) NULL,

    normalized_row_code VARCHAR(50) NOT NULL,
    rack_code VARCHAR(50) NOT NULL,

    -- Referência opcional aos eixos visuais
    map_column_id INT UNSIGNED NULL,
    map_row_id INT UNSIGNED NULL,

    -- Coordenadas de desenho
    position_x DECIMAL(10, 2) NOT NULL,
    position_y DECIMAL(10, 2) NOT NULL,

    width DECIMAL(10, 2) NOT NULL DEFAULT 64,
    height DECIMAL(10, 2) NOT NULL DEFAULT 160,

    rotation DECIMAL(8, 2) NOT NULL DEFAULT 0,
    z_index INT NOT NULL DEFAULT 10,

    label VARCHAR(100) NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_rack_slot_address (
        map_id,
        normalized_row_code,
        rack_code
    ),

    KEY idx_rack_slot_external_row (
        external_row_id
    ),

    KEY idx_rack_slot_lookup (
        map_id,
        normalized_row_code,
        rack_code,
        active
    ),

    CONSTRAINT fk_rack_slot_map
        FOREIGN KEY (map_id)
        REFERENCES datacenter_maps(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_rack_slot_column
        FOREIGN KEY (map_column_id)
        REFERENCES map_columns(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_rack_slot_row
        FOREIGN KEY (map_row_id)
        REFERENCES map_rows(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- =========================================================
-- ELEMENTOS FIXOS
-- =========================================================

CREATE TABLE IF NOT EXISTS map_elements (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    map_id INT UNSIGNED NOT NULL,

    type ENUM(
        'PDU',
        'WALL',
        'DOOR',
        'CORRIDOR',
        'COLUMN',
        'UPS',
        'AIR_CONDITIONER',
        'ELECTRICAL_PANEL',
        'EMPTY_AREA',
        'CUSTOM'
    ) NOT NULL,

    label VARCHAR(150) NULL,
    custom_type VARCHAR(100) NULL,

    position_x DECIMAL(10, 2) NOT NULL,
    position_y DECIMAL(10, 2) NOT NULL,

    width DECIMAL(10, 2) NOT NULL,
    height DECIMAL(10, 2) NOT NULL,

    rotation DECIMAL(8, 2) NOT NULL DEFAULT 0,
    z_index INT NOT NULL DEFAULT 1,

    group_key VARCHAR(100) NULL,

    fill_color VARCHAR(20) NULL,
    border_color VARCHAR(20) NULL,
    text_color VARCHAR(20) NULL,

    visible BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_map_element_map_type (
        map_id,
        type
    ),

    KEY idx_map_element_group (
        group_key
    ),

    CONSTRAINT fk_map_element_map
        FOREIGN KEY (map_id)
        REFERENCES datacenter_maps(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================================
-- CONFIGURAÇÃO DE NORMALIZAÇÃO
-- =========================================================

CREATE TABLE IF NOT EXISTS map_matching_rules (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    map_id INT UNSIGNED NOT NULL,

    rack_number_strategy ENUM(
        'TRAILING_NUMBER',
        'FULL_NAME',
        'REGEX'
    ) NOT NULL DEFAULT 'TRAILING_NUMBER',

    rack_name_pattern VARCHAR(255) NULL,

    uppercase_row BOOLEAN NOT NULL DEFAULT TRUE,
    trim_values BOOLEAN NOT NULL DEFAULT TRUE,
    remove_spaces_from_row BOOLEAN NOT NULL DEFAULT FALSE,

    rack_code_padding INT UNSIGNED NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_matching_rule_map (map_id),

    CONSTRAINT fk_matching_rule_map
        FOREIGN KEY (map_id)
        REFERENCES datacenter_maps(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
