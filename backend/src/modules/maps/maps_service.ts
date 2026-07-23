import { MapDTO } from './maps_dto';
import { createMap } from './maps_repository';

export async function createMapService(map: MapDTO) {
    return await createMap(map);
}