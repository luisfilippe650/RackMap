import { FastifyInstance } from "fastify";
import {
    createColumnsController,
    createRowsController,
    getAxesController,
    reorderColumnsController,
    reorderRowsController,
    setColumnWidthController,
    setRowHeightController,
} from "./axes_controller";

const prefix = "/maps/:mapId/axes";

export async function AxesRoutes(app: FastifyInstance) {
    app.register(async (routes) => {
        routes.get("/", getAxesController);
        routes.post("/columns", createColumnsController);
        routes.post("/rows", createRowsController);
        routes.put("/columns/order", reorderColumnsController);
        routes.put("/rows/order", reorderRowsController);
        routes.patch("/columns/:columnId/width", setColumnWidthController);
        routes.patch("/rows/:rowId/height", setRowHeightController);
    }, { prefix });
}
