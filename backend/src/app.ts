import fastify from 'fastify';
import { AxesRoutes } from "./modules/axes/axes_router";
import { ElementsRoutes } from "./modules/elements/elements_router";
import { MapRoutes } from "./modules/maps/maps_router";
import { MapEditorRoutes } from "./modules/map-editor/mapEditor_router";
import { RackSlotsRoutes } from "./modules/rack-slots/rackSlots_router";
import { RenderingRoutes } from "./modules/rendering/rendering_router";
import { RackTablesRoutes } from "./modules/racktables/rackTables_router";


const PREFIX = "/v1/rackmap" //prefixo principal da api


export const app = fastify();

app.addHook("onRequest", async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type");

    if (request.method === "OPTIONS") {
        return reply.status(204).send();
    }
});

//verificar se a api subiu corretamente
app.get("/health", async() => ({ status: "ok" }));


app.register(MapRoutes, {prefix: PREFIX});
app.register(MapEditorRoutes, {prefix: PREFIX});
app.register(AxesRoutes, {prefix: PREFIX});
app.register(RackSlotsRoutes, {prefix: PREFIX});
app.register(ElementsRoutes, {prefix: PREFIX});
app.register(RenderingRoutes, {prefix: PREFIX});
app.register(RackTablesRoutes, {prefix: PREFIX});
