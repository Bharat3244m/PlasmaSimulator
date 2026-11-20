const { v4: uuidv4 } = require("uuid");

const SimulationEngine =
    require("../../../simulation/simulation-engine");


class SimulationService {

    constructor() {

        // Temporary in-memory storage.
        // MongoDB will replace persistence later.

        this.simulations = new Map();
    }


    // ==========================================
    // CREATE
    // ==========================================

    create(parameters) {

        const simulationId =
            uuidv4();


        const now =
            new Date().toISOString();


        const engine =
            new SimulationEngine(parameters);


        // Temporary particle for engine testing.
        // Later particle generation will use
        // temperature/density parameters.

        engine.createTestParticle();


        const simulation = {

            schemaVersion: 1,

            simulationId,

            status: "idle",

            elapsedSeconds: 0,

            parameters: {
                ...parameters
            },

            createdAt: now,
            updatedAt: now,

            startedAt: null,
            completedAt: null,

            engine
        };


        this.simulations.set(
            simulationId,
            simulation
        );


        return this.toPublicSimulation(
            simulation
        );
    }


    // ==========================================
    // FIND INTERNAL SIMULATION
    // ==========================================

    findInternal(simulationId) {

        const simulation =
            this.simulations.get(
                simulationId
            );


        if (!simulation) {

            const error =
                new Error(
                    "Simulation not found"
                );

            error.status = 404;
            error.code =
                "SIMULATION_NOT_FOUND";

            throw error;
        }


        return simulation;
    }


    // ==========================================
    // GET
    // ==========================================

    get(simulationId) {

        const simulation =
            this.findInternal(
                simulationId
            );


        this.syncWithEngine(simulation);


        return this.toPublicSimulation(
            simulation
        );
    }


    // ==========================================
    // ACTION
    // ==========================================

    performAction(
        simulationId,
        action
    ) {

        const simulation =
            this.findInternal(
                simulationId
            );


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

                const error =
                    new Error(
                        "Unknown simulation action"
                    );

                error.status = 400;
                error.code =
                    "INVALID_ACTION";

                throw error;
            }
        }


        simulation.updatedAt =
            new Date().toISOString();


        this.syncWithEngine(simulation);


        return this.toPublicSimulation(
            simulation
        );
    }


    // ==========================================
    // START
    // ==========================================

    start(simulation) {

        if (
            simulation.status === "running"
        ) {

            const error =
                new Error(
                    "Simulation is already running"
                );

            error.status = 409;
            error.code =
                "INVALID_STATE_TRANSITION";

            throw error;
        }


        simulation.engine.start();

        simulation.status =
            "running";


        if (!simulation.startedAt) {

            simulation.startedAt =
                new Date().toISOString();
        }
    }


    // ==========================================
    // PAUSE
    // ==========================================

    pause(simulation) {

        if (
            simulation.status !== "running"
        ) {

            const error =
                new Error(
                    "Only a running simulation can be paused"
                );

            error.status = 409;
            error.code =
                "INVALID_STATE_TRANSITION";

            throw error;
        }


        simulation.engine.pause();

        simulation.status =
            "paused";
    }


    // ==========================================
    // RESET
    // ==========================================

    reset(simulation) {

        simulation.engine.reset();


        // Temporary test particle.
        simulation.engine
            .createTestParticle();


        simulation.status =
            "idle";

        simulation.elapsedSeconds =
            0;

        simulation.startedAt =
            null;

        simulation.completedAt =
            null;
    }


    // ==========================================
    // RESULTS
    // ==========================================

    getResults(simulationId) {

        const simulation =
            this.findInternal(
                simulationId
            );


        const snapshot =
            simulation.engine
                .getSnapshot();


        return {

            schemaVersion:
                simulation.schemaVersion,

            simulationId:
                simulation.simulationId,

            status:
                simulation.status,

            elapsedSeconds:
                snapshot.elapsedSeconds,

            metrics: {

                particleCount:
                    snapshot.metrics
                        .particleCount,

                // Not implemented yet.
                peakDensity: null,

                // Not implemented yet.
                energyConfinementMs: null,

                wallImpactCount:
                    snapshot.metrics
                        .wallImpactCount

            }

        };
    }


    // ==========================================
    // ENGINE SYNCHRONIZATION
    // ==========================================

    syncWithEngine(simulation) {

        simulation.status =
            simulation.engine.status;

        simulation.elapsedSeconds =
            simulation.engine
                .elapsedSeconds;
    }


    // ==========================================
    // REMOVE ENGINE BEFORE RETURNING JSON
    // ==========================================

    toPublicSimulation(simulation) {

        return {

            schemaVersion:
                simulation.schemaVersion,

            simulationId:
                simulation.simulationId,

            status:
                simulation.status,

            elapsedSeconds:
                simulation.elapsedSeconds,

            parameters: {
                ...simulation.parameters
            },

            createdAt:
                simulation.createdAt,

            updatedAt:
                simulation.updatedAt,

            startedAt:
                simulation.startedAt,

            completedAt:
                simulation.completedAt

        };
    }
}


module.exports =
    new SimulationService();