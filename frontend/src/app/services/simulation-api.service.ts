import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export const SIMULATION_API_URL = 'http://localhost:3000/api/v1';

export interface SimulationParameters {
  magneticField: number;
  electronDensity: number;
  electronTemperature: number;
  ionTemperature: number;
  chamberRadius: number;
}

export interface SimulationResponse {
  schemaVersion: number;
  simulationId: string;
  status: string;
  elapsedSeconds: number;
  parameters: SimulationParameters;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface SimulationResults {
  simulationId: string;
  status: string;
  elapsedSeconds: number;
  metrics: {
    particleCount: number | null;
    peakDensity: number | null;
    energyConfinementMs: number | null;
    wallImpactCount?: number | null;
  };
}

@Injectable({ providedIn: 'root' })
export class SimulationApiService {
  private readonly http = inject(HttpClient);

  createSimulation(parameters: SimulationParameters): Observable<SimulationResponse> {
    return this.http.post<SimulationResponse>(`${SIMULATION_API_URL}/simulations`, {
      schemaVersion: 1,
      parameters,
    });
  }

  performAction(simulationId: string, action: 'start' | 'pause' | 'reset'): Observable<SimulationResponse> {
    return this.http.post<SimulationResponse>(`${SIMULATION_API_URL}/simulations/${simulationId}/actions`, { action });
  }

  getResults(simulationId: string): Observable<SimulationResults> {
    return this.http.get<SimulationResults>(`${SIMULATION_API_URL}/simulations/${simulationId}/results`);
  }
}
