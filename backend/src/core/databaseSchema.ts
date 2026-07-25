import { prisma } from './prisma';

let rackNetworkLinksTablePromise: Promise<void> | null = null;

export function ensureRackNetworkLinksTable() {
    rackNetworkLinksTablePromise ??= prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS rack_network_links (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            map_id INT UNSIGNED NOT NULL,
            source_rack_slot_id INT UNSIGNED NOT NULL,
            target_rack_slot_id INT UNSIGNED NOT NULL,
            name VARCHAR(150) NOT NULL,
            color VARCHAR(20) NULL,
            cable_type VARCHAR(100) NULL,
            path_json JSON NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_rack_network_link_map (map_id),
            KEY idx_rack_network_link_source (source_rack_slot_id),
            KEY idx_rack_network_link_target (target_rack_slot_id),
            CONSTRAINT fk_rack_network_link_map
                FOREIGN KEY (map_id)
                REFERENCES datacenter_maps(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
            CONSTRAINT fk_rack_network_link_source
                FOREIGN KEY (source_rack_slot_id)
                REFERENCES rack_slots(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
            CONSTRAINT fk_rack_network_link_target
                FOREIGN KEY (target_rack_slot_id)
                REFERENCES rack_slots(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        )
    `).then(async () => {
        const columns = await prisma.$queryRaw<Array<{ Field: string }>>`SHOW COLUMNS FROM rack_network_links LIKE 'path_json'`;

        if (columns.length === 0) {
            await prisma.$executeRawUnsafe('ALTER TABLE rack_network_links ADD COLUMN path_json JSON NULL AFTER cable_type');
        }
    }).then(() => undefined);

    return rackNetworkLinksTablePromise;
}
