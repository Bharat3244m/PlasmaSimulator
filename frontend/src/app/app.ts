import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

type RunStatus = 'idle' | 'running' | 'paused';

interface SimulationParameters {
  magneticField: number;
  electronDensity: number;
  electronTemperature: number;
  ionTemperature: number;
  chamberRadius: number;
}

interface Preset {
  name: string;
  description: string;
  values: SimulationParameters;
}

@Component({
  selector: 'app-root',
  imports: [DecimalPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly status = signal<RunStatus>('idle');
  protected readonly elapsedSeconds = signal(0);
  protected readonly activeTab = signal<'fields' | 'particles' | 'diagnostics'>('fields');
  protected readonly parameters = signal<SimulationParameters>({
    magneticField: 2.4,
    electronDensity: 4.8,
    electronTemperature: 125,
    ionTemperature: 38,
    chamberRadius: 0.42,
  });
  protected readonly presets: Preset[] = [
    { name: 'Tokamak edge', description: 'High-field, warm edge plasma', values: { magneticField: 2.4, electronDensity: 4.8, electronTemperature: 125, ionTemperature: 38, chamberRadius: 0.42 } },
    { name: 'Low-temperature', description: 'Tabletop glow-discharge profile', values: { magneticField: 0.18, electronDensity: 0.65, electronTemperature: 8, ionTemperature: 1.5, chamberRadius: 0.18 } },
    { name: 'Dense core', description: 'Compact high-density profile', values: { magneticField: 5.1, electronDensity: 11.2, electronTemperature: 310, ionTemperature: 94, chamberRadius: 0.31 } },
  ];
  protected readonly particleCount = computed(() => Math.round(this.parameters().electronDensity * 2100));
  protected readonly energyConfinement = computed(() => (this.parameters().magneticField * this.parameters().chamberRadius * 3.2).toFixed(2));
  protected readonly elapsedMicroseconds = computed(() => this.elapsedSeconds() * 1_000_000);
  protected readonly statusLabel = computed(() => this.status() === 'running' ? 'Simulation active' : this.status() === 'paused' ? 'Simulation paused' : 'Ready to run');

  protected updateParameter(key: keyof SimulationParameters, value: string): void {
    const number = Number(value);
    if (Number.isFinite(number)) this.parameters.update((current) => ({ ...current, [key]: number }));
  }

  protected selectPreset(preset: Preset): void {
    this.parameters.set({ ...preset.values });
    this.status.set('idle');
    this.elapsedSeconds.set(0);
  }

  protected toggleRun(): void {
    if (this.status() === 'running') { this.status.set('paused'); return; }
    this.status.set('running');
    this.elapsedSeconds.update((seconds) => seconds + 0.5);
  }

  protected reset(): void {
    this.status.set('idle');
    this.elapsedSeconds.set(0);
  }
}
