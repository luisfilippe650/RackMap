import { MapSchema } from './maps_dto';
import { FastifyReply, FastifyRequest } from "fastify";
import { createMapService } from "./maps_service";

export async function createMapController(request: FastifyRequest , reply : FastifyReply ) {
    
    const  body = MapSchema.parse(request.body);
    
    const map = await createMapService(body);
    
    return reply.status(201).send(map);
    
}

