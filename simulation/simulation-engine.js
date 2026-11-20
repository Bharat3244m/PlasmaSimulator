const Particle = require("./particle");
const FieldModel = require("./fields");
const BorisPusher = require("./boris-pusher");
const WallCollision = require("./wall-collision");
const Diagnostics = require("./diagnostics");
const PlasmaInitializer = require("./plasma-initializer");


class SimulationEngine {

    constructor(parameters) {

        this.validateParameters(parameters);


        this.parameters = {
            ...parameters
        };


        this.status = "idle";

        this.elapsedSeconds = 0;


        // Numerical time step
        this.dt = 1e-10;


        this.particles = [];

        this.events = [];


        this.fields =
            new FieldModel(this.parameters);


        this.diagnostics =
            new Diagnostics();
    }


    // ==========================================
    // PARAMETER VALIDATION
    // ==========================================

    validateParameters(parameters) {

        const required = [

            "magneticField",
            "electronDensity",
            "electronTemperature",
            "ionTemperature",
            "chamberRadius"

        ];


        for (const name of required) {

            const value =
                parameters[name];


            if (
                typeof value !== "number" ||
                !Number.isFinite(value) ||
                value < 0
            ) {

                throw new Error(
                    `Invalid simulation parameter: ${name}`
                );
            }
        }


        if (parameters.chamberRadius === 0) {

            throw new Error(
                "chamberRadius must be greater than zero"
            );
        }
    }


    // ==========================================
    // PARTICLES
    // ==========================================

    addParticle(particle) {

        this.particles.push(particle);
    }


    createTestParticle() {

        // Electron constants

        const ELECTRON_CHARGE =
            -1.602176634e-19;

        const ELECTRON_MASS =
            9.1093837015e-31;


        const particle =
            new Particle({

                id:
                    `electron-${this.particles.length + 1}`,

                species:
                    "electron",

                position: {
                    x: 0,
                    y: 0,
                    z: 0
                },

                velocity: {
                    x: 1e6,
                    y: 0,
                    z: 0
                },

                charge:
                    ELECTRON_CHARGE,

                mass:
                    ELECTRON_MASS

            });


        this.addParticle(particle);

        return particle;
    }

    // ==========================================
    // PLASMA INITIALIZATION
    // ==========================================

    initializePlasma(options = {}) {

        this.particles =
            PlasmaInitializer
                .createPopulation(

                    this.parameters,

                    options

                );
    }


    // ==========================================
    // SIMULATION CONTROL
    // ==========================================

    start() {

        if (this.status === "running") {
            return;
        }

        if (
            this.status !== "idle" &&
            this.status !== "paused"
        ) {

            throw new Error(
                `Cannot start simulation from state: ${this.status}`
            );
        }


        this.status = "running";
    }


    pause() {

        if (this.status !== "running") {
            return;
        }


        this.status = "paused";
    }


    reset() {

        this.status = "idle";

        this.elapsedSeconds = 0;

        this.events = [];

        this.particles = [];

        this.diagnostics.reset();
    }


    // ==========================================
    // PHYSICS STEP
    // ==========================================

    step() {

        if (this.status !== "running") {
            return;
        }


        this.events = [];


        for (const particle of this.particles) {

            if (!particle.active) {
                continue;
            }


            const fields =
                this.fields.getFieldsAt(
                    particle.position
                );


            BorisPusher.push(

                particle,

                fields.electric,

                fields.magnetic,

                this.dt

            );


            const collision =
                WallCollision.handle(

                    particle,

                    this.parameters.chamberRadius

                );


            if (collision) {

                this.events.push(
                    collision
                );

                this.diagnostics
                    .recordWallImpact();
            }
        }


        this.elapsedSeconds +=
            this.dt;


        this.diagnostics.recordStep();
    }


    // ==========================================
    // SNAPSHOT
    // ==========================================

    getSnapshot() {

        return {

            status:
                this.status,

            elapsedSeconds:
                this.elapsedSeconds,

            particles:
                this.particles.map(
                    particle => ({

                        id:
                            particle.id,

                        species:
                            particle.species,

                        position: {
                            ...particle.position
                        },

                        velocity: {
                            ...particle.velocity
                        }

                    })
                ),

            events:
                [...this.events],

            metrics:
                this.diagnostics.calculate(
                    this.particles
                )

        };
    }
}


module.exports = SimulationEngine;