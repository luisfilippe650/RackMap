import { FastifyInstance } from 'fastify';
import {
    findRackTablesRackByIdController,
    getRackTablesObjectSummaryController,
    getRackTablesRackOccupancyController,
    listRackTablesRacksController,
} from './rackTables_controller';

const prefix = '/racktables';

export async function RackTablesRoutes(app: FastifyInstance) {
    app.register(async (routes) => {
        routes.get('/racks', listRackTablesRacksController);
        routes.get('/racks/:rackId/occupancy', getRackTablesRackOccupancyController);
        routes.get('/racks/:rackId', findRackTablesRackByIdController);
        routes.get('/summary/:objectId', getRackTablesObjectSummaryController);
    }, { prefix });
}
