import {
    CreateColumnsDTO,
    CreateRowsDTO,
    ReorderAxisDTO,
    SetColumnWidthDTO,
    SetRowHeightDTO,
} from "./axes_dto";
import {
    createColumns,
    createRows,
    getAxes,
    reorderColumns,
    reorderRows,
    setColumnWidth,
    setRowHeight,
} from "./axes_repository";

export async function getAxesService(mapId: number) {
    return getAxes(mapId);
}

export async function createColumnsService(mapId: number, input: CreateColumnsDTO) {
    return createColumns(mapId, input);
}

export async function createRowsService(mapId: number, input: CreateRowsDTO) {
    return createRows(mapId, input);
}

export async function reorderColumnsService(mapId: number, input: ReorderAxisDTO) {
    return reorderColumns(mapId, input);
}

export async function reorderRowsService(mapId: number, input: ReorderAxisDTO) {
    return reorderRows(mapId, input);
}

export async function setColumnWidthService(
    mapId: number,
    columnId: number,
    input: SetColumnWidthDTO,
) {
    return setColumnWidth(mapId, columnId, input);
}

export async function setRowHeightService(
    mapId: number,
    rowId: number,
    input: SetRowHeightDTO,
) {
    return setRowHeight(mapId, rowId, input);
}
