import { FastifyInstance } from "fastify";
import {
    createRackSlotController,
    deleteRackSlotByIdController,
    findRackSlotByIdController,
    findRackSlotByPositionController,
    listRackSlotsController,
    setRackSlotActiveController,
    setRackSlotCoordinatesController,
    setRackSlotSizeController,
    updateRackSlotByIdController,
    updateRackSlotController,
} from "./rackSlots_controller";

const prefix = "/maps/:mapId/rack-slots";

export async function RackSlotsRoutes(app: FastifyInstance) {
    app.register(async (routes) => {
        routes.get("/", listRackSlotsController);
        routes.get("/position/:rowCode/:rackCode", findRackSlotByPositionController);
        routes.post("/", createRackSlotController);
        routes.put("/:slotId", updateRackSlotController);
        routes.patch("/:slotId/coordinates", setRackSlotCoordinatesController);
        routes.patch("/:slotId/size", setRackSlotSizeController);
        routes.patch("/:slotId/active", setRackSlotActiveController);
    }, { prefix });

    app.get("/rack-slots/:rackSlotId", findRackSlotByIdController);
    app.patch("/rack-slots/:rackSlotId", updateRackSlotByIdController);
    app.delete("/rack-slots/:rackSlotId", deleteRackSlotByIdController);
}
