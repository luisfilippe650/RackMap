import {
    CreateColumnsDTO,
    CreateRowsDTO,
    ReorderAxisDTO,
    SetAxesDTO,
    SetColumnWidthDTO,
    SetRowHeightDTO,
    UpdateColumnDTO,
    UpdateRowDTO,
} from "./axes_dto";
import {
    createColumns,
    createRows,
    deleteColumn,
    deleteRow,
    getAxes,
    listColumns,
    listRows,
    reorderColumns,
    reorderRows,
    setAxes,
    setColumnWidth,
    setRowHeight,
    updateColumn,
    updateRow,
} from "./axes_repository";

export async function getAxesService(mapId: number) {
    return getAxes(mapId);
}

export async function listColumnsService(mapId: number) {
    return listColumns(mapId);
}

export async function listRowsService(mapId: number) {
    return listRows(mapId);
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

export async function updateColumnService(columnId: number, input: UpdateColumnDTO) {
    return updateColumn(columnId, input);
}

export async function updateRowService(rowId: number, input: UpdateRowDTO) {
    return updateRow(rowId, input);
}

export async function deleteColumnService(columnId: number) {
    return deleteColumn(columnId);
}

export async function deleteRowService(rowId: number) {
    return deleteRow(rowId);
}

export async function setAxesService(mapId: number, input: SetAxesDTO) {
    return setAxes(mapId, input);
}
