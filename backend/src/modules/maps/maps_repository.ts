import { prisma } from "../../core/prisma"; 
import { MapDTO } from "./maps_dto";


export function createMap(map: MapDTO){
    return prisma.map.create({
        data: map
    });
}

