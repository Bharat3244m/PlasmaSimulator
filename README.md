# Plasma Simulator

A browser-based educational plasma simulation that models charged-particle motion in a simplified tokamak-inspired confinement chamber.

The project combines a numerical plasma simulation engine with a Node.js/Express backend, MongoDB persistence, Socket.IO live updates, and an AngularJS frontend.

> **Scientific scope:** This is a reduced educational plasma model, not a full-fidelity tokamak or fusion reactor simulation.

---

## Features

### Simulation Engine

- Electron and deuterium-ion particles
- Temperature-based thermal particle initialization
- Macroparticle representation
- Lorentz-force particle motion
- Boris particle pusher
- Prescribed magnetic field
- Circular confinement chamber
- Wall collision detection
- Wall-impact diagnostics
- Start, pause, and reset simulation controls
- Continuous numerical stepping
- Real-time simulation snapshots

### Backend

- Node.js + Express REST API
- Simulation lifecycle management
- Input validation
- Standardized API errors
- UUID-based simulation IDs
- MongoDB persistence using Mongoose
- Create, read, update, list, and delete simulations
- Persistent simulation configurations
- Run-summary checkpointing
- Runtime reconstruction from MongoDB
- Socket.IO live simulation streaming

### Frontend

The frontend is developed using AngularJS and Canvas.

Its responsibilities include:

- Simulation parameter controls
- Start / Pause / Reset controls
- Rendering particle positions received from the simulation engine
- Displaying diagnostics
- Loading and saving simulations
- Scaling physical coordinates into Canvas coordinates

The frontend must not independently calculate particle motion.

---

# Architecture

```text
                    AngularJS Frontend
                           |
             +-------------+-------------+
             |                           |
          REST API                    Socket.IO
             |                           |
             v                           v
        Express API              simulation.updated
             |                           ^
             v                           |
      SimulationService ----------------+
          |          |
          |          |
          v          v
     MongoDB     SimulationRunner
                       |
                       v
                SimulationEngine
                       |
          +------------+------------+
          |            |            |
          v            v            v
      FieldModel   BorisPusher   WallCollision
                       |
                       v
                    Particles
```

REST is used for simulation configuration, lifecycle operations, persistence, and results.

Socket.IO is used for live particle snapshots.

MongoDB does **not** store every animation frame.

---

# Project Structure

```text
plasma-simulator/
|
├── README.md
├── .gitignore
|
├── simulation/
|   ├── constants.js
|   ├── particle.js
|   ├── fields.js
|   ├── boris-pusher.js
|   ├── wall-collision.js
|   ├── diagnostics.js
|   ├── plasma-initializer.js
|   ├── simulation-engine.js
|   ├── simulation-runner.js
|   ├── snapshot-serializer.js
|   |
|   └── tests/
|       ├── physics.test.js
|       ├── zero-field.test.js
|       ├── wall-collision.test.js
|       ├── plasma-initializer.test.js
|       └── snapshot-serializer.test.js
|
├── backend/
|   ├── package.json
|   ├── .env
|   ├── .env.example
|   |
|   ├── src/
|   |   ├── server.js
|   |   ├── app.js
|   |   |
|   |   ├── config/
|   |   |   └── database.js
|   |   |
|   |   ├── models/
|   |   |   └── simulation.model.js
|   |   |
|   |   ├── routes/
|   |   |   └── simulations.routes.js
|   |   |
|   |   ├── controllers/
|   |   |   └── simulations.controller.js
|   |   |
|   |   ├── services/
|   |   |   └── simulation.service.js
|   |   |
|   |   └── middleware/
|   |       └── error-handler.js
|   |
|   └── tests/
|       └── socket-client.test.js
|
└── frontend/
    └── AngularJS frontend files
```

---

# Technologies

| Technology | Purpose |
|---|---|
| JavaScript | Main implementation language |
| Node.js | Backend runtime |
| Express.js | REST API |
| Socket.IO | Live simulation streaming |
| MongoDB | Persistent storage |
| Mongoose | MongoDB object modeling |
| AngularJS | Frontend application |
| HTML5 Canvas | Particle visualization |

---

# Scientific Model

Particle motion is based on the Lorentz force:

```text
m dv/dt = q(E + v x B)
```

where:

- `m` = particle mass
- `q` = particle charge
- `E` = electric field
- `B` = magnetic field
- `v` = particle velocity

The current first-version model uses a prescribed magnetic field.

The particle trajectories are advanced using the **Boris pusher**, which is well suited for numerical integration of charged-particle motion in electromagnetic fields.

---

## Particle Species

The current simulation contains:

### Electrons

```text
charge = -e
mass   = electron mass
```

### Deuterium ions

```text
charge = +e
mass   = deuterium ion mass
```

The initial particle velocities are generated from the configured electron and ion temperatures.

Because a physical plasma contains an enormous number of particles, each computational particle represents many real particles.

These are referred to as **macroparticles**.

---

# Simulation Parameters

The following names and units form the canonical frontend/backend contract.

| Property | Meaning | Unit |
|---|---|---|
| `magneticField` | Applied magnetic field | T |
| `electronDensity` | Electron density | 10^19 m^-3 |
| `electronTemperature` | Electron temperature | eV |
| `ionTemperature` | Ion temperature | eV |
| `chamberRadius` | Chamber radius | m |

Example:

```json
{
  "magneticField": 2.4,
  "electronDensity": 4.8,
  "electronTemperature": 125,
  "ionTemperature": 38,
  "chamberRadius": 0.42
}
```

Do not rename these fields or change their units without updating the shared frontend/backend contract.

---

# Prerequisites

Install:

- Node.js
- npm
- MongoDB
- MongoDB Shell (`mongosh`) — optional but useful for development

Check:

```bash
node --version
npm --version
mongod --version
```

Optional:

```bash
mongosh --version
```

---

# MongoDB Setup

Check whether MongoDB is running:

```bash
sudo systemctl status mongod
```

Start it if necessary:

```bash
sudo systemctl start mongod
```

Enable MongoDB at boot:

```bash
sudo systemctl enable mongod
```

The development database is:

```text
plasma_simulator
```

---

# Environment Configuration

Inside `backend/`, create:

```text
.env
```

Example:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/plasma_simulator
```

Do not commit `.env`.

The repository should contain:

```text
.env.example
```

with example values.

---

# Backend Setup

Enter the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start:

```bash
npm start
```

Development mode:

```bash
npm run dev
```

Expected output:

```text
MongoDB connected successfully
Database: plasma_simulator

================================
Tokamak Simulator Backend
================================
Server: http://localhost:3000
Health: http://localhost:3000/api/health
API: http://localhost:3000/api/v1
Socket.IO: enabled
MongoDB: connected
================================
```

---

# Health Check

```bash
curl http://localhost:3000/api/health
```

Example:

```json
{
  "status": "ok",
  "service": "tokamak-simulator-backend",
  "timestamp": "2026-11-24T00:00:00.000Z"
}
```

---

# REST API

Base path:

```text
/api/v1
```

## Create Simulation

```http
POST /api/v1/simulations
```

Example:

```bash
curl -X POST \
http://localhost:3000/api/v1/simulations \
-H "Content-Type: application/json" \
-d '{
  "schemaVersion": 1,
  "parameters": {
    "magneticField": 2.4,
    "electronDensity": 4.8,
    "electronTemperature": 125,
    "ionTemperature": 38,
    "chamberRadius": 0.42
  }
}'
```

---

## List Simulations

```http
GET /api/v1/simulations
```

```bash
curl http://localhost:3000/api/v1/simulations
```

---

## Get Simulation

```http
GET /api/v1/simulations/:simulationId
```

Example:

```bash
curl \
http://localhost:3000/api/v1/simulations/$ID
```

---

## Update Simulation

```http
PUT /api/v1/simulations/:simulationId
```

Example:

```bash
curl -X PUT \
http://localhost:3000/api/v1/simulations/$ID \
-H "Content-Type: application/json" \
-d '{
  "name": "Baseline Experiment",
  "description": "2.4 T baseline confinement experiment"
}'
```

Parameters can also be updated while the simulation is not running.

---

## Delete Simulation

```http
DELETE /api/v1/simulations/:simulationId
```

```bash
curl -X DELETE \
http://localhost:3000/api/v1/simulations/$ID
```

---

# Simulation Controls

All lifecycle actions use:

```http
POST /api/v1/simulations/:simulationId/actions
```

## Start

```bash
curl -X POST \
http://localhost:3000/api/v1/simulations/$ID/actions \
-H "Content-Type: application/json" \
-d '{"action":"start"}'
```

## Pause

```bash
curl -X POST \
http://localhost:3000/api/v1/simulations/$ID/actions \
-H "Content-Type: application/json" \
-d '{"action":"pause"}'
```

## Reset

```bash
curl -X POST \
http://localhost:3000/api/v1/simulations/$ID/actions \
-H "Content-Type: application/json" \
-d '{"action":"reset"}'
```

Reset returns the simulation to:

```text
status = idle
elapsedSeconds = 0
```

---

# Results

```http
GET /api/v1/simulations/:simulationId/results
```

Example:

```bash
curl \
http://localhost:3000/api/v1/simulations/$ID/results
```

Example response:

```json
{
  "schemaVersion": 1,
  "simulationId": "UUID",
  "status": "paused",
  "elapsedSeconds": 0.00005,
  "metrics": {
    "particleCount": 300,
    "peakDensity": null,
    "energyConfinementMs": null,
    "wallImpactCount": 0
  }
}
```

Metrics that have not yet been implemented use `null`.

---

# API Error Format

Errors follow:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid simulation parameters",
    "fields": {
      "magneticField": "Must be >= 0"
    }
  }
}
```

Common status codes:

| HTTP status | Meaning |
|---|---|
| `400` | Invalid input |
| `404` | Simulation not found |
| `409` | Invalid simulation state transition |
| `500` | Internal server error |

---

# Socket.IO Live Simulation

Socket.IO provides live particle snapshots.

The frontend first subscribes to a simulation.

## Frontend → Backend

### Subscribe

```text
simulation.subscribe
```

Payload:

```text
simulationId
```

### Unsubscribe

```text
simulation.unsubscribe
```

Payload:

```text
simulationId
```

---

# Backend → Frontend

### Subscription Confirmation

```text
simulation.subscribed
```

### Live Snapshot

```text
simulation.updated
```

Example:

```json
{
  "schemaVersion": 1,
  "simulationId": "UUID",
  "status": "running",
  "elapsedSeconds": 0.000001,

  "chamber": {
    "radius": 0.42
  },

  "particles": [
    {
      "id": "electron-1",
      "species": "electron",
      "x": 0.176,
      "y": 0.195
    },
    {
      "id": "deuterium-1",
      "species": "deuterium",
      "x": -0.12,
      "y": 0.08
    }
  ],

  "events": [],

  "metrics": {
    "particleCount": 300,
    "wallImpactCount": 0
  }
}
```

Particle coordinates are in **metres relative to the chamber centre**.

The frontend is responsible for converting physical coordinates into Canvas coordinates.

---

## Socket Error

```text
simulation.error
```

---

# Persistence Strategy

MongoDB stores:

```text
simulation ID
schema version
name
description
parameters
status
run summary
timestamps
```

It does **not** store every particle position from every frame.

Live particle positions remain runtime data.

A typical MongoDB record contains:

```json
{
  "simulationId": "UUID",

  "schemaVersion": 1,

  "name": "Baseline Experiment",

  "parameters": {
    "magneticField": 2.4,
    "electronDensity": 4.8,
    "electronTemperature": 125,
    "ionTemperature": 38,
    "chamberRadius": 0.42
  },

  "status": "paused",

  "runSummary": {
    "elapsedSeconds": 0.000076,
    "particleCount": 300,
    "wallImpactCount": 0,
    "peakDensity": null,
    "energyConfinementMs": null
  }
}
```

Run summaries are checkpointed periodically rather than written on every simulation frame.

---

# Inspecting MongoDB

Start:

```bash
mongosh
```

Select database:

```javascript
use plasma_simulator
```

Show collections:

```javascript
show collections
```

List simulations:

```javascript
db.simulations.find().pretty()
```

Example query:

```javascript
db.simulations.findOne({
    simulationId: "YOUR_SIMULATION_ID"
})
```

---

# Physics Tests

Run from the project root.

## Uniform Magnetic Field

```bash
node simulation/tests/physics.test.js
```

Checks:

- charged-particle gyromotion
- velocity evolution
- approximate kinetic-energy conservation

---

## Zero Field

```bash
node simulation/tests/zero-field.test.js
```

Checks that:

```text
E = 0
B = 0
```

produces constant-velocity straight-line motion.

---

## Wall Collision

```bash
node simulation/tests/wall-collision.test.js
```

Checks:

- wall crossing detection
- reflected velocity
- impact event generation
- wall impact counter

---

## Plasma Initialization

```bash
node simulation/tests/plasma-initializer.test.js
```

Checks:

- electron population
- deuterium population
- thermal velocity generation
- particles remain inside chamber
- macroparticle weights
- electrons have greater thermal speeds than deuterium ions

---

## Snapshot Contract

```bash
node simulation/tests/snapshot-serializer.test.js
```

Checks that live simulation snapshots match the frontend/backend interface.

---

# Current Scientific Assumptions

The current implementation intentionally simplifies real plasma physics.

Current assumptions include:

- 2D visualization domain
- prescribed magnetic field
- simplified chamber geometry
- computational macroparticles
- no self-consistent electrostatic field yet
- no full tokamak magnetic geometry
- no plasma-fluid coupling
- no fusion reaction modelling
- no radiation transport
- no full collision operator

The simulator is intended for educational visualization and software experimentation.

---

# Optional Future Physics

A reduced Particle-in-Cell extension may later add:

```text
Particles
    |
    v
Charge deposition
    |
    v
Charge-density grid
    |
    v
Poisson solver
    |
    v
Electrostatic potential
    |
    v
Electric field
    |
    v
Field interpolation
    |
    v
Boris particle update
```

This is a stretch goal and is not required for the initial working simulator.

---

# Development Rules

- Use short-lived feature branches.
- Do not commit `node_modules/`.
- Do not commit `.env`.
- Do not commit passwords or credentials.
- Keep `.env.example` updated.
- Keep physics calculations out of the frontend renderer.
- Keep Canvas coordinate conversion out of the physics engine.
- Do not rename canonical API properties without updating the integration contract.
- Do not change parameter units silently.
- Do not persist every live particle frame to MongoDB.
- Test components before merging into `main`.

---

# Git Workflow

Start from the latest `main`:

```bash
git checkout main
git pull origin main
```

Create a feature branch:

```bash
git checkout -b feature/example
```

Commit:

```bash
git add .
git commit -m "Implement example feature"
```

Push:

```bash
git push -u origin feature/example
```

Create a Pull Request into `main`, review, test, and merge.

---

# Current Development Status

### Completed

- Simulation engine
- Boris particle pusher
- Electron/deuterium plasma initialization
- Macroparticle representation
- Wall collision handling
- Physics sanity tests
- Simulation lifecycle
- Continuous numerical runner
- REST API
- API validation
- MongoDB persistence
- CRUD operations
- Runtime reconstruction
- Run-summary checkpointing
- Socket.IO live updates
- Live particle snapshot contract

### In Progress / Remaining

- Full AngularJS integration
- Complete Canvas visualization integration
- End-to-end testing
- Additional diagnostics
- Automated backend API tests
- Restart-state recovery improvements
- UI/error handling polish

### Optional

- User authentication and sessions, if required by the course rubric
- Reduced PIC / Poisson solver
- More realistic tokamak magnetic geometry
- Additional plasma diagnostics

---

# Team Integration Contract

The shared frontend/backend contract is maintained separately in:

```text
FRONTEND_BACKEND_CONTRACT.md
```

When changing:

- parameter names
- parameter units
- simulation statuses
- REST response structures
- Socket.IO event names
- live snapshot structure

update the contract **before merging the interface change**.

---

# License

Academic / educational project.