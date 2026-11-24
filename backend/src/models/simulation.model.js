const mongoose = require("mongoose");

// ==========================================
// PARAMETERS
// ==========================================

const parametersSchema = new mongoose.Schema(
    {
        magneticField: {
            type: Number,
            required: true,
            min: 0,
        },

        electronDensity: {
            type: Number,
            required: true,
            min: 0,
        },

        electronTemperature: {
            type: Number,
            required: true,
            min: 0,
        },

        ionTemperature: {
            type: Number,
            required: true,
            min: 0,
        },

        chamberRadius: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        _id: false,
    },
);

// ==========================================
// RUN SUMMARY
// ==========================================

const runSummarySchema = new mongoose.Schema(
    {
        elapsedSeconds: {
            type: Number,
            default: 0,
        },

        particleCount: {
            type: Number,
            default: 0,
        },

        wallImpactCount: {
            type: Number,
            default: 0,
        },

        peakDensity: {
            type: Number,
            default: null,
        },

        energyConfinementMs: {
            type: Number,
            default: null,
        },
    },
    {
        _id: false,
    },
);

// ==========================================
// SIMULATION
// ==========================================

const simulationSchema = new mongoose.Schema(
    {
        simulationId: {
            type: String,

            required: true,

            unique: true,

            index: true,
        },

        schemaVersion: {
            type: Number,

            required: true,

            default: 1,
        },

        name: {
            type: String,

            trim: true,

            default: "Untitled Simulation",
        },

        description: {
            type: String,

            trim: true,

            default: "",
        },

        parameters: {
            type: parametersSchema,

            required: true,
        },

        status: {
            type: String,

            enum: [
                "idle",
                "queued",
                "running",
                "paused",
                "completed",
                "failed",
            ],

            default: "idle",
        },

        runSummary: {
            type: runSummarySchema,

            default: () => ({}),
        },

        startedAt: {
            type: Date,

            default: null,
        },

        completedAt: {
            type: Date,

            default: null,
        },
    },

    {
        timestamps: true,
    },
);

module.exports = mongoose.model("Simulation", simulationSchema);
