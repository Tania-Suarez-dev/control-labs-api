export const EQUIPMENT_TYPES = ['COMPUTADOR', 'MOUSE', 'TECLADO', 'CARGADOR', 'TELEVISOR', 'CONTROL_TV'] as const;
export type EquipmentType = (typeof EQUIPMENT_TYPES)[number];

export const EQUIPMENT_STATUSES = ['OPERATIVO', 'MANTENIMIENTO', 'FUERA_DE_SERVICIO'] as const;
export type EquipmentStatus = (typeof EQUIPMENT_STATUSES)[number];

export interface ICreateEquipmentDTO {
  placaSena: string;
  codigoActivo: string;
  tipo: EquipmentType;
  roomId: string;
}

export interface IUpdateEquipmentDTO {
  estado?: EquipmentStatus;
  roomId?: string;
}

export interface IMoveEquipmentDTO {
  roomId: string;
}
