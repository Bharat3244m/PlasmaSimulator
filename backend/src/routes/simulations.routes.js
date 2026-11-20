const express =
    require("express");

const controller =
    require("../controllers/simulations.controller");


const router =
    express.Router();


// Create simulation

router.post(
    "/simulations",
    controller.createSimulation
);


// Get simulation

router.get(
    "/simulations/:simulationId",
    controller.getSimulation
);


// Start / Pause / Reset

router.post(
    "/simulations/:simulationId/actions",
    controller.performAction
);


// Results

router.get(
    "/simulations/:simulationId/results",
    controller.getResults
);


module.exports = router;