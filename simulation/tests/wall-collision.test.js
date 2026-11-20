const Particle =
    require("../particle");

const WallCollision =
    require("../wall-collision");


const particle =
    new Particle({

        id: "wall-test",

        species: "test",

        position: {
            x: 0.43,
            y: 0,
            z: 0
        },

        velocity: {
            x: 1000,
            y: 0,
            z: 0
        },

        charge: 1,

        mass: 1
    });


const chamberRadius = 0.42;


console.log("\n==============================");
console.log("BEFORE COLLISION");
console.log("==============================");

console.log("Position:");
console.log(particle.position);

console.log("Velocity:");
console.log(particle.velocity);


const collision =
    WallCollision.handle(
        particle,
        chamberRadius
    );


console.log("\n==============================");
console.log("AFTER COLLISION");
console.log("==============================");

console.log("Position:");
console.log(particle.position);

console.log("Velocity:");
console.log(particle.velocity);

console.log(
    "Particle wall impacts:",
    particle.wallImpactCount
);

console.log("\nCollision event:");
console.log(collision);


// ==========================================
// VALIDATION
// ==========================================

const reflected =
    particle.velocity.x < 0;

const insideChamber =
    Math.sqrt(
        particle.position.x ** 2 +
        particle.position.y ** 2
    ) < chamberRadius;

const impactRecorded =
    particle.wallImpactCount === 1;

const eventCreated =
    collision !== null &&
    collision.type === "wallImpact";


console.log("\n==============================");
console.log("RESULT");
console.log("==============================");

console.log(
    "Velocity reflected:",
    reflected
);

console.log(
    "Particle inside chamber:",
    insideChamber
);

console.log(
    "Impact recorded:",
    impactRecorded
);

console.log(
    "Event created:",
    eventCreated
);


if (
    reflected &&
    insideChamber &&
    impactRecorded &&
    eventCreated
) {

    console.log(
        "\nPASS: Wall collision works."
    );

} else {

    console.log(
        "\nFAIL: Wall collision incorrect."
    );
}