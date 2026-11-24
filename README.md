# Plasma Simulator

A browser-based educational plasma simulator for visualizing charged-particle motion inside a simplified tokamak-inspired confinement chamber.

The project uses a numerical particle simulation engine with a Node.js backend, MongoDB persistence, Socket.IO live updates, and an AngularJS frontend.

> This is a simplified educational plasma model, not a full tokamak or fusion-reactor simulation.

---

## Features

- Electron and deuterium-ion simulation
- Temperature-based particle initialization
- Lorentz-force particle motion
- Boris particle pusher
- Prescribed electromagnetic fields
- Circular confinement chamber
- Wall collision detection
- Real-time particle visualization
- Start, pause, and reset controls
- MongoDB experiment persistence
- REST API
- Socket.IO live updates
- AngularJS + HTML5 Canvas frontend

---

## Architecture

```text
AngularJS Frontend
       |
       | REST + Socket.IO
       v
Express Backend
       |
       +------ MongoDB
       |
       v
Simulation Engine
       |
       +-- Field Model
       +-- Boris Pusher
       +-- Wall Collision
       +-- Diagnostics
       |
       v
Particles
```

The backend performs the physics simulation. The frontend only renders particle positions received from the backend.

---

## Technologies

| Technology | Purpose |
|---|---|
| JavaScript | Main language |
| AngularJS | Frontend |
| HTML5 Canvas | Particle visualization |
| Node.js | Backend runtime |
| Express.js | REST API |
| Socket.IO | Real-time updates |
| MongoDB | Database |
| Mongoose | MongoDB integration |

---

## Project Structure

```text
plasma-simulator/
│
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── directives/
│   │   ├── config/
│   │   └── constants/
│   └── templates/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── config/
│   └── package.json
│
└── simulation/
    ├── simulation-engine.js
    ├── simulation-runner.js
    ├── particle.js
    ├── plasma-initializer.js
    ├── fields.js
    ├── boris-pusher.js
    ├── wall-collision.js
    ├── diagnostics.js
    └── tests/
```

---

## Simulation Parameters

| Parameter | Meaning | Unit |
|---|---|---|
| `magneticField` | Magnetic field | T |
| `electronDensity` | Electron density | 10¹⁹ m⁻³ |
| `electronTemperature` | Electron temperature | eV |
| `ionTemperature` | Ion temperature | eV |
| `chamberRadius` | Chamber radius | m |

---

## Physics Model

Particle motion follows the Lorentz force:

```text
F = q(E + v × B)
```

Particle trajectories are advanced using the **Boris pusher**.

The simulation currently uses electrons and deuterium ions represented by computational macroparticles.

The model is intentionally simplified for educational visualization.

---

## Requirements

Install:

- Node.js
- npm
- MongoDB

Check that MongoDB is running:

```bash
sudo systemctl status mongod
```

If necessary:

```bash
sudo systemctl start mongod
```

---

## Setup

Clone the repository:

```bash
git clone https://github.com/Bharat3244m/PlasmaSimulator.git
cd PlasmaSimulator
```

### Backend

Install dependencies:

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/plasma_simulator
```

Start the backend:

```bash
npm start
```

Backend:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

---

### Frontend

From the project root:

```bash
npx http-server frontend -p 4200
```

Open:

```text
http://localhost:4200
```

The frontend can also be accessed through the machine's local network address when the backend CORS configuration permits it.

---

## API

Base URL:

```text
http://localhost:3000/api/v1
```

Main endpoints:

```text
POST   /simulations
GET    /simulations
GET    /simulations/:simulationId
PUT    /simulations/:simulationId
DELETE /simulations/:simulationId

POST   /simulations/:simulationId/actions
GET    /simulations/:simulationId/results
```

Simulation actions:

```json
{ "action": "start" }
```

```json
{ "action": "pause" }
```

```json
{ "action": "reset" }
```

---

## Live Simulation

Socket.IO is used to stream live simulation data.

Main events:

```text
simulation.subscribe
simulation.unsubscribe

simulation.subscribed
simulation.updated
simulation.error
```

`simulation.updated` contains the latest particle positions, simulation time, chamber information, and metrics.

---

## MongoDB

MongoDB stores:

- Simulation parameters
- Simulation metadata
- Status
- Run summaries
- Timestamps

Live particle frames are **not** stored in MongoDB.

Database:

```text
plasma_simulator
```

To inspect it:

```bash
mongosh
```

```javascript
use plasma_simulator
db.simulations.find().pretty()
```

---

## Tests

Run physics tests from the project root:

```bash
node simulation/tests/physics.test.js
node simulation/tests/zero-field.test.js
node simulation/tests/wall-collision.test.js
node simulation/tests/plasma-initializer.test.js
node simulation/tests/snapshot-serializer.test.js
```

These test particle motion, energy conservation, wall collisions, plasma initialization, and the frontend snapshot format.

---

## Current Limitations

The simulator currently uses a reduced plasma model.

It does not yet include:

- Full tokamak magnetic geometry
- Self-consistent Particle-in-Cell fields
- Full particle collision physics
- Fusion reactions
- Radiation transport

These are possible future extensions.

---

## Development

Do not commit:

```text
node_modules/
.env
```

Keep physics calculations inside the simulation engine. The frontend should only visualize data produced by the backend.

The shared frontend/backend interface is documented in:

```text
FRONTEND_BACKEND_CONTRACT.md
```

---

## License

Academic / educational project.