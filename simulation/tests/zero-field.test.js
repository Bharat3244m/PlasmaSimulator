const SimulationEngine = require("../simulation-engine");

const parameters = {
    magneticField: 0,
    electronDensity: 4.8,
    electronTemperature: 125,
    ionTemperature: 38,

    // Large chamber so the wall cannot interfere
    chamberRadius: 10
};

const simulation = new SimulationEngine(parameters);

const particle = simulation.createTestParticle();

simulation.start();

const initialPosition = {
    ...particle.position
};

const initialVelocity = {
    ...particle.velocity
};

const STEPS = 1000;

for (let i = 0; i < STEPS; i++) {
    simulation.step();
}


// Expected position:
//
// x = x0 + vx * t
// y = y0 + vy * t

const expectedX =
    initialPosition.x +
    initialVelocity.x *
    simulation.elapsedSeconds;

const expectedY =
    initialPosition.y +
    initialVelocity.y *
    simulation.elapsedSeconds;


console.log("\n==============================");
console.log("ZERO FIELD TEST");
console.log("==============================");

console.log(
    "Elapsed time:",
    simulation.elapsedSeconds
);

console.log("\nInitial velocity:");
console.log(initialVelocity);

console.log("\nFinal velocity:");
console.log(particle.velocity);

console.log("\nExpected position:");

console.log({
    x: expectedX,
    y: expectedY
});

console.log("\nActual position:");
console.log(particle.position);


const positionError =
    Math.sqrt(
        (particle.position.x - expectedX) ** 2 +
        (particle.position.y - expectedY) ** 2
    );


const velocityError =
    Math.sqrt(
        (particle.velocity.x - initialVelocity.x) ** 2 +
        (particle.velocity.y - initialVelocity.y) ** 2 +
        (particle.velocity.z - initialVelocity.z) ** 2
    );


console.log("\n==============================");
console.log("ERROR");
console.log("==============================");

console.log(
    "Position error:",
    positionError
);

console.log(
    "Velocity error:",
    velocityError
);


if (
    positionError < 1e-12 &&
    velocityError < 1e-12
) {

    console.log("\nPASS: Straight-line motion correct.");

} else {

    console.log("\nFAIL: Unexpected motion detected.");
}