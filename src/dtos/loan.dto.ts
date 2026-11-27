export interface ICreateLoanDTO {
  roomId: string;
  instructorId: string;
  guardaId: string;
  numeroPc: number;
  equipmentIds: string[];
}

export interface ICreateLoanRequestDTO {
  roomId: string;
  instructorId: string;
  numeroPc: number;
  equipmentIds: string[];
}
