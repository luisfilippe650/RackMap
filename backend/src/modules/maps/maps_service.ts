import {
    AssociateRackTablesLocationsDTO,
    ConfigureNormalizationRulesDTO,
    CreateSourceLocationDTO,
    CreateMapDTO,
    ListMapsDTO,
    SetMapDimensionsDTO,
    UpdateMapDTO,
} from './maps_dto';
import {
    associateRackTablesLocations,
    configureNormalizationRules,
    createSourceLocation,
    createMap,
    deleteMap,
    deleteSourceLocation,
    duplicateMap,
    findMapById,
    listSourceLocations,
    listMaps,
    setMapDimensions,
    updateMap,
} from './maps_repository';

export async function createMapService(map: CreateMapDTO) {
    return createMap(map);
}

export async function listMapsService(filters: ListMapsDTO) {
    return listMaps(filters);
}

export async function findMapByIdService(id: number) {
    return findMapById(id);
}

export async function listSourceLocationsService(mapId: number) {
    return listSourceLocations(mapId);
}

export async function createSourceLocationService(mapId: number, location: CreateSourceLocationDTO) {
    return createSourceLocation(mapId, location);
}

export async function deleteSourceLocationService(mapId: number, sourceLocationId: number) {
    return deleteSourceLocation(mapId, sourceLocationId);
}

export async function updateMapService(id: number, map: UpdateMapDTO) {
    return updateMap(id, map);
}

export async function deleteMapService(id: number) {
    return deleteMap(id);
}

export async function duplicateMapService(id: number) {
    return duplicateMap(id);
}

export async function setMapDimensionsService(id: number, dimensions: SetMapDimensionsDTO) {
    return setMapDimensions(id, dimensions);
}

export async function associateRackTablesLocationsService(
    id: number,
    input: AssociateRackTablesLocationsDTO,
) {
    return associateRackTablesLocations(id, input);
}

export async function configureNormalizationRulesService(
    id: number,
    rules: ConfigureNormalizationRulesDTO,
) {
    return configureNormalizationRules(id, rules);
}
