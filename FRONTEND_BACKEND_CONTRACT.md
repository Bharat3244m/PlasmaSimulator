j# PlasmaSimulator — Frontend/Backend Integration Contract

This is the shared contract for connecting `frontend/` to `backend/`. The interface currently uses local sample values; replace that state with these API responses without renaming JSON properties or changing units.

## Canonical simulation parameters

Use the exact **camelCase** names and numeric base units below in requests, responses, database records, and live-update messages.

| Property | Meaning | Unit | Example |
| --- | --- | --- | --- |
| `magneticField` | Applied field, B0 | tesla (`T`) | `2.4` |
| `electronDensity` | Electron density, ne | `10^19 m^-3` | `4.8` |
| `electronTemperature` | Electron temperature, Te | electronvolt (`eV`) | `125` |
| `ionTemperature` | Ion temperature, Ti | electronvolt (`eV`) | `38` |
| `chamberRadius` | Chamber radius, R | metre (`m`) | `0.42` |

All five values are JSON numbers—never display strings such as `"2.4 T"`. Do not silently use `m^-3` for `electronDensity`; if required internally, expose it separately as `electronDensityPerCubicMeter`.

## IDs, status, and time

* `simulationId`: string (UUID recommended).
* `status`: one of `idle`, `queued`, `running`, `paused`, `completed`, `failed`.
* `elapsedSeconds`: number in seconds. The UI displays microseconds: `elapsedSeconds * 1_000_000`.
* `createdAt`, `updatedAt`, `startedAt`, `completedAt`: ISO-8601 UTC strings.
* Keep `schemaVersion` (start at `1`) in saved simulation and result payloads. Add optional properties instead of repurposing existing ones.

## REST API proposal

Base path: `/api/v1`; use `Content-Type: application/json`.

### Create run

`POST /simulations`

```json
{
  "schemaVersion": 1,
  "parameters": {
    "magneticField": 2.4,
    "electronDensity": 4.8,
    "electronTemperature": 125,
    "ionTemperature": 38,
    "chamberRadius": 0.42
  }
}
```

Return `201` with the saved simulation including `simulationId`, `status`, timestamps, and the unchanged `parameters` object.

### Run controls and results

* `POST /simulations/:simulationId/actions` with `{ "action": "start" | "pause" | "reset" }`; return the updated simulation. Reset sets `elapsedSeconds` to `0` and status to `idle`.
* `GET /simulations/:simulationId` returns the saved simulation including `parameters`, `status`, and `elapsedSeconds`.
* `GET /simulations/:simulationId/results` returns a `metrics` object containing `particleCount` (count), `peakDensity` (`10^19 m^-3`), and `energyConfinementMs` (milliseconds). Use `null` for unavailable metrics, not a text placeholder.

## Error and merge rules

Use `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "electronDensity": "Must be >= 0" } } }`. Return `400` for invalid inputs, `404` unknown IDs, `409` invalid state changes, and `500` server failures. Permit `http://localhost:4200` via CORS for local development.

Before merging, validate that all five parameters are finite and non-negative, keep the API base URL in one frontend config value (not a component), and agree on polling or a `simulation.updated` WebSocket/SSE event. Update this document before changing a field, unit, status, or response shape.
