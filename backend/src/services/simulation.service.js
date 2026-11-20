const { v4: uuidv4 } = require("uuid");

const SimulationEngine =
    require("../../../simulation/simulation-engine");

const SimulationRunner =
    require("../../../simulation/simulation-runner");


class SimulationService {

    constructor() {

        // Temporary in-memory storage.
        // MongoDB persistence will be added later.

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


        engine.initializePlasma({
            electronCount: 150,
            ionCount: 150
        });


        const runner =
            new SimulationRunner(
                engine,
                {
                    updateRate: 60,
                    stepsPerUpdate: 100
                }
            );


        const simulation = {

            schemaVersion: 1,

            simulationId,

            parameters: {
                ...parameters
            },

            createdAt: now,
            updatedAt: now,

            startedAt: null,
            completedAt: null,

            // Runtime components
            engine,
            runner
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
    // GET SIMULATION
    // ==========================================

    get(simulationId) {

        const simulation =
            this.findInternal(
                simulationId
            );


        return this.toPublicSimulation(
            simulation
        );
    }


    // ==========================================
    // PERFORM ACTION
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


        return this.toPublicSimulation(
            simulation
        );
    }


    // ==========================================
    // START
    // ==========================================

    start(simulation) {

        // Engine is now the single source
        // of truth for runtime status.

        if (
            simulation.engine.status ===
            "running"
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

        simulation.runner.start();


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
            simulation.engine.status !==
            "running"
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


        simulation.runner.pause();

        simulation.engine.pause();
    }


    // ==========================================
    // RESET
    // ==========================================

    reset(simulation) {

        simulation.runner.stop();

        simulation.engine.reset();


        simulation.engine
            .initializePlasma({
                electronCount: 150,
                ionCount: 150
            });


        simulation.startedAt = null;

        simulation.completedAt = null;
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
                simulation.engine.status,

            elapsedSeconds:
                simulation.engine
                    .elapsedSeconds,

            metrics: {

                particleCount:
                    snapshot.metrics
                        .particleCount,

                peakDensity:
                    null,

                energyConfinementMs:
                    null,

                wallImpactCount:
                    snapshot.metrics
                        .wallImpactCount

            }

        };
    }


    // ==========================================
    // PUBLIC API REPRESENTATION
    // ==========================================

    toPublicSimulation(simulation) {

        return {

            schemaVersion:
                simulation.schemaVersion,

            simulationId:
                simulation.simulationId,


            // Runtime state comes DIRECTLY
            // from SimulationEngine.

            status:
                simulation.engine.status,

            elapsedSeconds:
                simulation.engine
                    .elapsedSeconds,


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