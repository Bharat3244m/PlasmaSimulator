const { v4: uuidv4 } = require("uuid");

const SimulationEngine = require("../../../simulation/simulation-engine");

const SimulationRunner = require("../../../simulation/simulation-runner");

const SnapshotSerializer = require("../../../simulation/snapshot-serializer");

const SimulationModel = require("../models/simulation.model");

const CHECKPOINT_INTERVAL_MS = 5000;

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
            updateRate: 30,

            stepsPerUpdate: 500,

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

            lastCheckpointAt: Date.now(),

            checkpointInProgress: false,
        };

        this.simulations.set(simulationId, runtime);

        return this.toPublicSimulation(runtime, document);
    }

    async findDocument(simulationId) {
        const document = await SimulationModel.findOne({
            simulationId,
        });

        if (!document) {
            const error = new Error("Simulation not found");

            error.status = 404;

            error.code = "SIMULATION_NOT_FOUND";

            throw error;
        }

        return document;
    }

    createRuntime(simulationId, parameters) {
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

        const runtime = {
            simulationId,

            engine,

            runner,
        };

        this.simulations.set(simulationId, runtime);

        return runtime;
    }

    async ensureRuntime(document) {
        const simulationId = document.simulationId;

        const existing = this.simulations.get(simulationId);

        if (existing) {
            return existing;
        }

        const parameters = document.parameters.toObject();

        const runtime = this.createRuntime(simulationId, parameters);

        return runtime;
    }

    startCheckpointing(simulationId) {
        const runtime = this.simulations.get(simulationId);

        if (!runtime) {
            return;
        }

        // Prevent duplicate timers.

        if (runtime.checkpointTimer) {
            return;
        }

        runtime.checkpointTimer = setInterval(async () => {
            try {
                await this.persistRunSummary(simulationId);
            } catch (error) {
                console.error(
                    `Checkpoint failed for ${simulationId}:`,
                    error.message,
                );
            }
        }, 5000);
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

    async get(simulationId) {
        const document = await this.findDocument(simulationId);

        const runtime = await this.ensureRuntime(document);

        return this.toPublicSimulation(runtime, document);
    }

    // ==========================================
    // PERFORM ACTION
    // ==========================================

    async performAction(simulationId, action) {
        const document = await this.findDocument(simulationId);

        const runtime = await this.ensureRuntime(document);

        switch (action) {
            case "start":
                this.start(runtime);

                this.startCheckpointing(simulationId);

                document.status = "running";

                if (!document.startedAt) {
                    document.startedAt = new Date();
                }

                break;

            case "pause":
                this.pause(runtime);

                this.stopCheckpointing(simulationId);

                document.status = "paused";

                break;

            case "reset":
                this.stopCheckpointing(simulationId);

                this.reset(runtime);

                document.status = "idle";

                document.startedAt = null;

                document.completedAt = null;

                break;

            default: {
                const error = new Error("Unknown simulation action");

                error.status = 400;

                error.code = "INVALID_ACTION";

                throw error;
            }
        }

        document.runSummary.elapsedSeconds = runtime.engine.elapsedSeconds;

        document.runSummary.particleCount = runtime.engine.particles.length;

        document.runSummary.wallImpactCount =
            runtime.engine.diagnostics.wallImpactCount;

        await document.save();

        return this.toPublicSimulation(runtime, document);
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

    pause(runtime) {
        if (runtime.engine.status !== "running") {
            const error = new Error("Only a running simulation can be paused");

            error.status = 409;

            error.code = "INVALID_STATE_TRANSITION";

            throw error;
        }

        runtime.runner.pause();

        runtime.engine.pause();
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

    async maybeCheckpoint(simulationId) {
        const runtime = this.simulations.get(simulationId);

        if (!runtime) {
            return;
        }

        const now = Date.now();

        const elapsed = now - runtime.lastCheckpointAt;

        if (elapsed < CHECKPOINT_INTERVAL_MS) {
            return;
        }

        if (runtime.checkpointInProgress) {
            return;
        }

        runtime.checkpointInProgress = true;

        try {
            await this.persistRunSummary(simulationId);

            runtime.lastCheckpointAt = now;
        } catch (error) {
            console.error(
                `Checkpoint failed for ${simulationId}:`,
                error.message,
            );
        } finally {
            runtime.checkpointInProgress = false;
        }
    }

    async persistRunSummary(simulationId) {
        const runtime = this.simulations.get(simulationId);

        if (!runtime) {
            return;
        }

        const snapshot = runtime.engine.getSnapshot();

        const result = await SimulationModel.updateOne(
            {
                simulationId,
            },

            {
                $set: {
                    status: runtime.engine.status,

                    "runSummary.elapsedSeconds": runtime.engine.elapsedSeconds,

                    "runSummary.particleCount": snapshot.metrics.particleCount,

                    "runSummary.wallImpactCount":
                        snapshot.metrics.wallImpactCount,

                    updatedAt: new Date(),
                },
            },
        );

        console.log(
            `[checkpoint] ${simulationId}`,
            `t=${runtime.engine.elapsedSeconds}`,
            `matched=${result.matchedCount}`,
        );
    }

    // ==========================================
    // PUBLIC API REPRESENTATION
    // ==========================================

    toPublicSimulation(runtime, document) {
        return {
            schemaVersion: document.schemaVersion,

            simulationId: document.simulationId,

            name: document.name,

            description: document.description,

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

    async list() {
        const documents = await SimulationModel.find().sort({
            createdAt: -1,
        });

        return documents.map((document) => ({
            schemaVersion: document.schemaVersion,

            simulationId: document.simulationId,

            name: document.name,

            description: document.description,

            status: document.status,

            parameters: document.parameters.toObject(),

            runSummary: document.runSummary.toObject(),

            createdAt: document.createdAt.toISOString(),

            updatedAt: document.updatedAt.toISOString(),
        }));
    }

    async checkpointAll() {
        const ids = Array.from(this.simulations.keys());

        for (const simulationId of ids) {
            this.stopCheckpointing(simulationId);
        }

        await Promise.all(
            ids.map((simulationId) => this.persistRunSummary(simulationId)),
        );
    }

    async delete(simulationId) {
        const document = await this.findDocument(simulationId);

        const runtime = this.simulations.get(simulationId);

        if (runtime) {
            this.stopCheckpointing(simulationId);

            runtime.runner.stop();

            this.simulations.delete(simulationId);
        }

        await SimulationModel.deleteOne({
            simulationId: document.simulationId,
        });

        return {
            simulationId,

            deleted: true,
        };
    }

    async update(simulationId, updates) {
        const document = await this.findDocument(simulationId);

        const runtime = this.simulations.get(simulationId);

        if (runtime && runtime.engine.status === "running") {
            const error = new Error("Cannot modify a running simulation");

            error.status = 409;

            error.code = "INVALID_STATE_TRANSITION";

            throw error;
        }

        if (updates.name !== undefined) {
            document.name = updates.name;
        }

        if (updates.description !== undefined) {
            document.description = updates.description;
        }

        if (updates.parameters !== undefined) {
            document.parameters = updates.parameters;

            // Existing runtime no longer represents
            // the new configuration.

            if (runtime) {
                runtime.runner.stop();

                this.simulations.delete(simulationId);
            }
        }

        await document.save();

        const newRuntime = await this.ensureRuntime(document);

        return this.toPublicSimulation(newRuntime, document);
    }

    stopCheckpointing(simulationId) {
        const runtime = this.simulations.get(simulationId);

        if (!runtime || !runtime.checkpointTimer) {
            return;
        }

        clearInterval(runtime.checkpointTimer);

        runtime.checkpointTimer = null;
    }
}

module.exports = new SimulationService();
