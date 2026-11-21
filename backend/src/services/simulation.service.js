const { v4: uuidv4 } = require("uuid");

const SimulationEngine = require("../../../simulation/simulation-engine");

const SimulationRunner = require("../../../simulation/simulation-runner");

const SnapshotSerializer = require("../../../simulation/snapshot-serializer");

const SimulationModel = require("../models/simulation.model");

class SimulationService {
    constructor() {
        // Temporary in-memory storage.
        // MongoDB persistence will be added later.

        this.simulations = new Map();
        this.io = null;
    }

    emitSnapshot(simulationId, engine) {
        if (!this.io) {
            return;
        }

        const snapshot = SnapshotSerializer.serialize(simulationId, engine);

        const room = `simulation:${simulationId}`;

        this.io.to(room).emit("simulation.updated", snapshot);
    }

    setSocketServer(io) {
        this.io = io;
    }

    // ==========================================
    // CREATE
    // ==========================================

    async create(parameters) {
        const simulationId = uuidv4();

        const engine = new SimulationEngine(parameters);

        engine.initializePlasma({
            electronCount: 150,
            ionCount: 150,
        });

        const runner = new SimulationRunner(engine, {
            updateRate: 60,

            stepsPerUpdate: 100,

            onSnapshot: () => {
                this.emitSnapshot(simulationId, engine);
            },
        });

        // ======================================
        // SAVE PERSISTENT STATE
        // ======================================

        const document = await SimulationModel.create({
            simulationId,

            schemaVersion: 1,

            parameters,

            status: "idle",

            runSummary: {
                elapsedSeconds: 0,

                particleCount: engine.particles.length,

                wallImpactCount: 0,

                peakDensity: null,

                energyConfinementMs: null,
            },
        });

        // ======================================
        // STORE RUNTIME OBJECTS
        // ======================================

        const runtime = {
            simulationId,

            engine,

            runner,
        };

        this.simulations.set(simulationId, runtime);

        return this.toPublicSimulation(runtime, document);
    }

    // ==========================================
    // FIND INTERNAL SIMULATION
    // ==========================================

    findInternal(simulationId) {
        const simulation = this.simulations.get(simulationId);

        if (!simulation) {
            const error = new Error("Simulation not found");

            error.status = 404;

            error.code = "SIMULATION_NOT_FOUND";

            throw error;
        }

        return simulation;
    }

    // ==========================================
    // GET SIMULATION
    // ==========================================

    get(simulationId) {
        const simulation = this.findInternal(simulationId);

        return this.toPublicSimulation(simulation);
    }

    // ==========================================
    // PERFORM ACTION
    // ==========================================

    performAction(simulationId, action) {
        const simulation = this.findInternal(simulationId);

        switch (action) {
            case "start":
                this.start(simulation);

                break;

            case "pause":
                this.pause(simulation);

                break;

            case "reset":
                this.reset(simulation);

                break;

            default: {
                const error = new Error("Unknown simulation action");

                error.status = 400;

                error.code = "INVALID_ACTION";

                throw error;
            }
        }

        simulation.updatedAt = new Date().toISOString();

        return this.toPublicSimulation(simulation);
    }

    // ==========================================
    // START
    // ==========================================

    start(simulation) {
        // Engine is now the single source
        // of truth for runtime status.

        if (simulation.engine.status === "running") {
            const error = new Error("Simulation is already running");

            error.status = 409;

            error.code = "INVALID_STATE_TRANSITION";

            throw error;
        }

        simulation.engine.start();

        simulation.runner.start();

        if (!simulation.startedAt) {
            simulation.startedAt = new Date().toISOString();
        }
    }

    // ==========================================
    // PAUSE
    // ==========================================

    pause(simulation) {
        if (simulation.engine.status !== "running") {
            const error = new Error("Only a running simulation can be paused");

            error.status = 409;

            error.code = "INVALID_STATE_TRANSITION";

            throw error;
        }

        simulation.runner.pause();

        simulation.engine.pause();
    }

    // ==========================================
    // RESET
    // ==========================================

    reset(simulation) {
        simulation.runner.stop();

        simulation.engine.reset();

        simulation.engine.initializePlasma({
            electronCount: 150,
            ionCount: 150,
        });

        simulation.startedAt = null;

        simulation.completedAt = null;
    }

    // ==========================================
    // RESULTS
    // ==========================================

    getResults(simulationId) {
        const simulation = this.findInternal(simulationId);

        const snapshot = simulation.engine.getSnapshot();

        return {
            schemaVersion: simulation.schemaVersion,

            simulationId: simulation.simulationId,

            status: simulation.engine.status,

            elapsedSeconds: simulation.engine.elapsedSeconds,

            metrics: {
                particleCount: snapshot.metrics.particleCount,

                peakDensity: null,

                energyConfinementMs: null,

                wallImpactCount: snapshot.metrics.wallImpactCount,
            },
        };
    }

    // ==========================================
    // PUBLIC API REPRESENTATION
    // ==========================================

    toPublicSimulation(runtime, document) {
        return {
            schemaVersion: document.schemaVersion,

            simulationId: document.simulationId,

            status: runtime.engine.status,

            elapsedSeconds: runtime.engine.elapsedSeconds,

            parameters: {
                ...document.parameters.toObject(),
            },

            createdAt: document.createdAt.toISOString(),

            updatedAt: document.updatedAt.toISOString(),

            startedAt: document.startedAt
                ? document.startedAt.toISOString()
                : null,

            completedAt: document.completedAt
                ? document.completedAt.toISOString()
                : null,
        };
    }
}

module.exports = new SimulationService();
