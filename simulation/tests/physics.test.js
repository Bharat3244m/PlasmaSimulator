const SimulationEngine =
    require("../simulation-engine");


// ==========================================
// PARAMETERS
// ==========================================

const parameters = {

    magneticField: 2.4,

    electronDensity: 4.8,

    electronTemperature: 125,

    ionTemperature: 38,

    chamberRadius: 0.42

};


// ==========================================
// CREATE SIMULATION
// ==========================================

const simulation =
    new SimulationEngine(parameters);


const particle =
    simulation.createTestParticle();


simulation.start();


// ==========================================
// INITIAL VALUES
// ==========================================

const initialSpeed =
    Math.sqrt(
        particle.velocity.x ** 2 +
        particle.velocity.y ** 2 +
        particle.velocity.z ** 2
    );


const initialEnergy =
    0.5 *
    particle.mass *
    initialSpeed ** 2;


console.log("\n==============================");
console.log("INITIAL STATE");
console.log("==============================");

console.log("Position:");
console.log(particle.position);

console.log("\nVelocity:");
console.log(particle.velocity);

console.log(
    "\nSpeed:",
    initialSpeed,
    "m/s"
);

console.log(
    "Kinetic Energy:",
    initialEnergy,
    "J"
);


// ==========================================
// RUN SIMULATION
// ==========================================

const STEPS = 1000;


for (let i = 0; i < STEPS; i++) {

    simulation.step();
}


// ==========================================
// FINAL VALUES
// ==========================================

const finalSpeed =
    Math.sqrt(
        particle.velocity.x ** 2 +
        particle.velocity.y ** 2 +
        particle.velocity.z ** 2
    );


const finalEnergy =
    0.5 *
    particle.mass *
    finalSpeed ** 2;


console.log("\n==============================");
console.log("FINAL STATE");
console.log("==============================");

console.log("Position:");
console.log(particle.position);

console.log("\nVelocity:");
console.log(particle.velocity);

console.log(
    "\nSpeed:",
    finalSpeed,
    "m/s"
);

console.log(
    "Kinetic Energy:",
    finalEnergy,
    "J"
);


// ==========================================
// ENERGY CONSERVATION
// ==========================================

const energyDifference =
    Math.abs(
        finalEnergy -
        initialEnergy
    );


const relativeEnergyError =
    energyDifference /
    initialEnergy;


console.log("\n==============================");
console.log("ENERGY TEST");
console.log("==============================");

console.log(
    "Initial Energy:",
    initialEnergy
);

console.log(
    "Final Energy:",
    finalEnergy
);

console.log(
    "Relative Error:",
    relativeEnergyError
);


// ==========================================
// SIMULATION INFO
// ==========================================

console.log("\n==============================");
console.log("SIMULATION");
console.log("==============================");

console.log(
    "Elapsed:",
    simulation.elapsedSeconds,
    "seconds"
);

console.log(
    "Steps:",
    simulation.diagnostics.totalSteps
);

console.log(
    "Wall impacts:",
    simulation.diagnostics.wallImpactCount
);