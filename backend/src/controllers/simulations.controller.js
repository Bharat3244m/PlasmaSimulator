const simulationService = require("../services/simulation.service");

// ==========================================
// CREATE SIMULATION
// ==========================================

exports.createSimulation = async (req, res, next) => {
    try {
        const { schemaVersion, parameters } = req.body;

        if (schemaVersion !== 1) {
            const error = new Error("schemaVersion must be 1");

            error.status = 400;
            error.code = "VALIDATION_ERROR";

            throw error;
        }

        validateParameters(parameters);

        const simulation = await simulationService.create(parameters);

        res.status(201).json(simulation);
    } catch (error) {
        next(error);
    }
};

// ==========================================
// GET SIMULATION
// ==========================================

exports.getSimulation = async (req, res, next) => {
    try {
        const simulation = await simulationService.get(req.params.simulationId);

        res.json(simulation);
    } catch (error) {
        next(error);
    }
};

// ==========================================
// ACTION
// ==========================================

exports.performAction = async (req, res, next) => {
    try {
        const { action } = req.body;

        const simulation = await simulationService.performAction(
            req.params.simulationId,

            action,
        );

        res.json(simulation);
    } catch (error) {
        next(error);
    }
};

exports.listSimulations = async (req, res, next) => {
    try {
        const simulations = await simulationService.list();

        res.json(simulations);
    } catch (error) {
        next(error);
    }
};

// ==========================================
// RESULTS
// ==========================================

exports.getResults = (req, res, next) => {
    try {
        const results = simulationService.getResults(req.params.simulationId);

        res.json(results);
    } catch (error) {
        next(error);
    }
};

exports.updateSimulation = async (req, res, next) => {
    try {
        const { name, description, parameters } = req.body;

        if (parameters) {
            validateParameters(parameters);
        }

        const simulation = await simulationService.update(
            req.params.simulationId,

            {
                name,
                description,
                parameters,
            },
        );

        res.json(simulation);
    } catch (error) {
        next(error);
    }
};

exports.deleteSimulation = async (req, res, next) => {
    try {
        const result = await simulationService.delete(req.params.simulationId);

        res.json(result);
    } catch (error) {
        next(error);
    }
};

// ==========================================
// PARAMETER VALIDATION
// ==========================================

function validateParameters(parameters) {
    const required = [
        "magneticField",
        "electronDensity",
        "electronTemperature",
        "ionTemperature",
        "chamberRadius",
    ];

    if (!parameters || typeof parameters !== "object") {
        const error = new Error("parameters object is required");

        error.status = 400;
        error.code = "VALIDATION_ERROR";

        throw error;
    }

    const fields = {};

    for (const name of required) {
        const value = parameters[name];

        if (typeof value !== "number" || !Number.isFinite(value)) {
            fields[name] = "Must be a finite number";
        } else if (value < 0) {
            fields[name] = "Must be >= 0";
        }
    }

    if (parameters.chamberRadius === 0) {
        fields.chamberRadius = "Must be greater than 0";
    }

    if (Object.keys(fields).length > 0) {
        const error = new Error("Invalid simulation parameters");

        error.status = 400;

        error.code = "VALIDATION_ERROR";

        error.fields = fields;

        throw error;
    }
}
