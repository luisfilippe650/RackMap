import {
    CreateElementDTO,
    GroupWallElementsDTO,
    ListElementsDTO,
    SetElementAppearanceDTO,
    SetElementPositionDTO,
    SetElementRotationDTO,
    SetElementSizeDTO,
    UpdateElementDTO,
} from "./elements_dto";
import {
    createElement,
    deleteElement,
    deleteElementById,
    findElementById,
    findElementByGlobalId,
    findElementsByIds,
    groupWallElements,
    listElements,
    mapExists,
    setElementAppearance,
    setElementPosition,
    setElementRotation,
    setElementSize,
    updateElement,
    updateElementById,
} from "./elements_repository";

export class ElementNotFoundError extends Error {}
export class ElementInvalidOperationError extends Error {}

async function ensureMapExists(mapId: number) {
    const map = await mapExists(mapId);

    if (!map) {
        throw new ElementNotFoundError('Map not found');
    }
}

async function ensureElementExists(mapId: number, elementId: number) {
    const element = await findElementById(mapId, elementId);

    if (!element) {
        throw new ElementNotFoundError('Element not found');
    }

    return element;
}

async function ensureElementExistsById(elementId: number) {
    const element = await findElementByGlobalId(elementId);

    if (!element) {
        throw new ElementNotFoundError('Element not found');
    }

    return element;
}

function ensureCustomTypeIsValid(currentType: string, currentCustomType: string | null, input: UpdateElementDTO) {
    const nextType = input.type ?? currentType;

    if (nextType !== 'CUSTOM' && (input.customType || (currentCustomType && input.customType !== null))) {
        throw new ElementInvalidOperationError('customType is only allowed when type is CUSTOM');
    }
}

export async function listElementsService(mapId: number, filters: ListElementsDTO) {
    await ensureMapExists(mapId);

    return listElements(mapId, filters);
}

export async function createElementService(mapId: number, input: CreateElementDTO) {
    await ensureMapExists(mapId);

    return createElement(mapId, input);
}

export async function updateElementService(
    mapId: number,
    elementId: number,
    input: UpdateElementDTO,
) {
    const currentElement = await ensureElementExists(mapId, elementId);

    ensureCustomTypeIsValid(currentElement.type, currentElement.customType, input);

    return updateElement(mapId, elementId, input);
}

export async function findElementByIdService(elementId: number) {
    return ensureElementExistsById(elementId);
}

export async function updateElementByIdService(elementId: number, input: UpdateElementDTO) {
    const currentElement = await ensureElementExistsById(elementId);

    ensureCustomTypeIsValid(currentElement.type, currentElement.customType, input);

    return updateElementById(elementId, input);
}

export async function deleteElementByIdService(elementId: number) {
    await ensureElementExistsById(elementId);

    return deleteElementById(elementId);
}

export async function deleteElementService(mapId: number, elementId: number) {
    await ensureElementExists(mapId, elementId);

    return deleteElement(mapId, elementId);
}

export async function setElementPositionService(
    mapId: number,
    elementId: number,
    input: SetElementPositionDTO,
) {
    await ensureElementExists(mapId, elementId);

    return setElementPosition(mapId, elementId, input);
}

export async function setElementSizeService(
    mapId: number,
    elementId: number,
    input: SetElementSizeDTO,
) {
    await ensureElementExists(mapId, elementId);

    return setElementSize(mapId, elementId, input);
}

export async function setElementRotationService(
    mapId: number,
    elementId: number,
    input: SetElementRotationDTO,
) {
    await ensureElementExists(mapId, elementId);

    return setElementRotation(mapId, elementId, input);
}

export async function setElementAppearanceService(
    mapId: number,
    elementId: number,
    input: SetElementAppearanceDTO,
) {
    await ensureElementExists(mapId, elementId);

    return setElementAppearance(mapId, elementId, input);
}

export async function groupWallElementsService(mapId: number, input: GroupWallElementsDTO) {
    await ensureMapExists(mapId);

    const elements = await findElementsByIds(mapId, input.elementIds);
    const foundIds = new Set(elements.map((element) => element.id));
    const missingIds = input.elementIds.filter((elementId) => !foundIds.has(elementId));

    if (missingIds.length > 0) {
        throw new ElementNotFoundError(`Elements not found: ${missingIds.join(', ')}`);
    }

    const nonWallIds = elements
        .filter((element) => element.type !== 'WALL')
        .map((element) => element.id);

    if (nonWallIds.length > 0) {
        throw new ElementInvalidOperationError(`Only WALL elements can be grouped: ${nonWallIds.join(', ')}`);
    }

    return groupWallElements(mapId, input);
}
