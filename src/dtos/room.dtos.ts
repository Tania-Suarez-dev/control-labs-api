export const ROOM_STATUSES = ['OPERATIVO', 'MANTENIMIENTO', 'INACTIVO'] as const;
export type RoomStatus = (typeof ROOM_STATUSES)[number];

export interface ICreateRoomDTO {
  nombre: string;
  bloque: string;
  capacidadPcs: number;
}