import { FastifyInstance } from "fastify";
import {
    createElementController,
    deleteElementByIdController,
    deleteElementController,
    findElementByIdController,
    groupWallElementsController,
    listElementsController,
    setElementAppearanceController,
    setElementPositionController,
    setElementRotationController,
    setElementSizeController,
    updateElementByIdController,
    updateElementController,
} from "./elements_controller";

const prefix = "/maps/:mapId/elements";

export async function ElementsRoutes(app: FastifyInstance) {
    app.register(async (routes) => {
        routes.get("/", listElementsController);
        routes.post("/", createElementController);
        routes.put("/wall-groups", groupWallElementsController);
        routes.put("/:elementId", updateElementController);
        routes.delete("/:elementId", deleteElementController);
        routes.patch("/:elementId/position", setElementPositionController);
        routes.patch("/:elementId/size", setElementSizeController);
        routes.patch("/:elementId/rotation", setElementRotationController);
        routes.patch("/:elementId/appearance", setElementAppearanceController);
    }, { prefix });

    app.get("/elements/:elementId", findElementByIdController);
    app.patch("/elements/:elementId", updateElementByIdController);
    app.delete("/elements/:elementId", deleteElementByIdController);
}
