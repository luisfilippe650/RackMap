import { FastifyInstance } from "fastify";
import {
    associateRackTablesLocationsController,
    configureNormalizationRulesController,
    createMapController,
    deleteMapController,
    findMapByIdController,
    listMapsController,
    setMapDimensionsController,
    updateMapController,
} from "./maps_controller";

const prefix = "/maps";

export async function MapRoutes(app: FastifyInstance) {
    app.register(async (routes) => {
        routes.post("/", createMapController);
        routes.get("/", listMapsController);
        routes.get("/:id", findMapByIdController);
        routes.put("/:id", updateMapController);
        routes.delete("/:id", deleteMapController);
        routes.patch("/:id/dimensions", setMapDimensionsController);
        routes.put("/:id/locations", associateRackTablesLocationsController);
        routes.put("/:id/normalization-rules", configureNormalizationRulesController);
    }, { prefix });
}
