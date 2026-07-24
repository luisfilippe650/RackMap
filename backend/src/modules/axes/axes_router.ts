import { FastifyInstance } from "fastify";
import {
    createColumnsController,
    createRowsController,
    deleteColumnController,
    deleteRowController,
    getAxesController,
    listColumnsController,
    listRowsController,
    reorderColumnsController,
    reorderRowsController,
    setAxesController,
    setColumnWidthController,
    setRowHeightController,
    updateColumnController,
    updateRowController,
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

    app.post("/maps/:mapId/columns", createColumnsController);
    app.get("/maps/:mapId/columns", listColumnsController);
    app.patch("/columns/:columnId", updateColumnController);
    app.delete("/columns/:columnId", deleteColumnController);

    app.post("/maps/:mapId/rows", createRowsController);
    app.get("/maps/:mapId/rows", listRowsController);
    app.patch("/rows/:rowId", updateRowController);
    app.delete("/rows/:rowId", deleteRowController);

    app.put("/maps/:mapId/axes", setAxesController);
}
