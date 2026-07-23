import fastify from 'fastify';
import { MapRoutes } from "./modules/maps/maps_router";


const PREFIX = "/v1/rackmap" //prefixo principal da api


export const app = fastify();


//verificar se a api subiu corretamente
app.get("/health", async() => ({ status: "ok" }));


app.register(MapRoutes, {prefix: PREFIX});



