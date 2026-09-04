import { apiRequest } from '../api';
import type { MachineCreateResponse, MachineRecord } from '../types';

export async function listMachines(authToken?: string | null) {
  return apiRequest<MachineRecord[]>('/machines', { authToken });
}

export async function createMachine(
  payload: { name: string; hostname: string },
  authToken?: string | null,
) {
  return apiRequest<MachineCreateResponse>('/machines', {
    method: 'POST',
    json: payload,
    authToken,
  });
}

export async function rotateMachineKey(machineId: string, authToken?: string | null) {
  return apiRequest<MachineCreateResponse>(`/machines/${machineId}/rotate-key`, {
    method: 'POST',
    authToken,
  });
}

export async function revokeMachine(machineId: string, authToken?: string | null) {
  return apiRequest<{ message: string; machine_id: string }>(`/machines/${machineId}`, {
    method: 'DELETE',
    authToken,
  });
}

