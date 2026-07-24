import { FastifyInstance } from "fastify";
import { renderMapController } from "./rendering_controller";

const prefix = "/maps/:mapId/rendering";

export async function RenderingRoutes(app: FastifyInstance) {
    app.register(async (routes) => {
        routes.get("/", renderMapController);
        routes.post("/", renderMapController);
    }, { prefix });

    app.get("/maps/:mapId/render", renderMapController);
}
