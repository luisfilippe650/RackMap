import { FastifyInstance } from "fastify";
import {
    associateRackTablesLocationsController,
    configureNormalizationRulesController,
    createSourceLocationController,
    createMapController,
    deleteMapController,
    deleteSourceLocationController,
    duplicateMapController,
    findMapByIdController,
    listSourceLocationsController,
    listMapsController,
    setMapDimensionsController,
    updateMapController,
} from "./maps_controller";

const prefix = "/maps";

export async function MapRoutes(app: FastifyInstance) {
    app.register(async (routes) => {
        routes.post("/", createMapController);
        routes.get("/", listMapsController);
        routes.get("/:mapId", findMapByIdController);
        routes.post("/:mapId/duplicate", duplicateMapController);
        routes.patch("/:mapId", updateMapController);
        routes.put("/:mapId", updateMapController);
        routes.delete("/:mapId", deleteMapController);
        routes.patch("/:mapId/dimensions", setMapDimensionsController);
        routes.post("/:mapId/source-locations", createSourceLocationController);
        routes.get("/:mapId/source-locations", listSourceLocationsController);
        routes.delete("/:mapId/source-locations/:sourceLocationId", deleteSourceLocationController);
        routes.put("/:mapId/locations", associateRackTablesLocationsController);
        routes.put("/:mapId/normalization-rules", configureNormalizationRulesController);
    }, { prefix });
}
