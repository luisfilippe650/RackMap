import { FastifyReply, FastifyRequest } from "fastify";
import {
    AssociateRackTablesLocationsSchema,
    ConfigureNormalizationRulesSchema,
    CreateMapSchema,
    ListMapsSchema,
    MapIdSchema,
    SetMapDimensionsSchema,
    UpdateMapSchema,
} from './maps_dto';
import {
    associateRackTablesLocationsService,
    configureNormalizationRulesService,
    createMapService,
    deleteMapService,
    findMapByIdService,
    listMapsService,
    setMapDimensionsService,
    updateMapService,
} from "./maps_service";


export async function createMapController(request: FastifyRequest, reply: FastifyReply) {
    const body = CreateMapSchema.parse(request.body);
    
    const map = await createMapService(body);

    return reply.status(201).send(map);
}


export async function listMapsController(request: FastifyRequest, reply: FastifyReply) {
    const query = ListMapsSchema.parse(request.query);
    
    const maps = await listMapsService(query);

    return reply.status(200).send(maps);
}


export async function findMapByIdController(request: FastifyRequest, reply: FastifyReply) {
    const { id } = MapIdSchema.parse(request.params);
    
    const map = await findMapByIdService(id);

    if (!map) {
        return reply.status(404).send({ message: 'Map not found' });
    }

    return reply.status(200).send(map);
}


export async function updateMapController(request: FastifyRequest, reply: FastifyReply) {
    const { id } = MapIdSchema.parse(request.params);
    
    const body = UpdateMapSchema.parse(request.body);
    
    const map = await updateMapService(id, body);

    return reply.status(200).send(map);
}


export async function deleteMapController(request: FastifyRequest, reply: FastifyReply) {
    const { id } = MapIdSchema.parse(request.params);

    await deleteMapService(id);

    return reply.status(204).send();
}


export async function setMapDimensionsController(request: FastifyRequest, reply: FastifyReply) {
    const { id } = MapIdSchema.parse(request.params);
    
    const body = SetMapDimensionsSchema.parse(request.body);
    
    const map = await setMapDimensionsService(id, body);

    return reply.status(200).send(map);
}


export async function associateRackTablesLocationsController(request: FastifyRequest, reply: FastifyReply,) {
    const { id } = MapIdSchema.parse(request.params);
    
    const body = AssociateRackTablesLocationsSchema.parse(request.body);
    
    const map = await associateRackTablesLocationsService(id, body);

    return reply.status(200).send(map);
}


export async function configureNormalizationRulesController(request: FastifyRequest, reply: FastifyReply,) {
    const { id } = MapIdSchema.parse(request.params);
    const body = ConfigureNormalizationRulesSchema.parse(request.body);
    const rules = await configureNormalizationRulesService(id, body);

    return reply.status(200).send(rules);
}
