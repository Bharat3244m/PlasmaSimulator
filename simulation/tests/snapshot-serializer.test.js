const SimulationEngine =
    require("../simulation-engine");

const SnapshotSerializer =
    require("../snapshot-serializer");


const parameters = {

    magneticField: 2.4,

    electronDensity: 4.8,

    electronTemperature: 125,

    ionTemperature: 38,

    chamberRadius: 0.42

};


const engine =
    new SimulationEngine(
        parameters
    );


engine.initializePlasma({
    electronCount: 5,
    ionCount: 5
});


engine.start();


for (
    let i = 0;
    i < 100;
    i++
) {

    engine.step();

}


const snapshot =
    SnapshotSerializer.serialize(
        "test-simulation",
        engine
    );


console.log(
    JSON.stringify(
        snapshot,
        null,
        2
    )
);


// ==========================================
// VALIDATION
// ==========================================

let passed = true;


if (
    snapshot.schemaVersion !== 1
) {

    console.log(
        "FAIL: schemaVersion"
    );

    passed = false;
}


if (
    snapshot.simulationId !==
    "test-simulation"
) {

    console.log(
        "FAIL: simulationId"
    );

    passed = false;
}


if (
    snapshot.particles.length !== 10
) {

    console.log(
        "FAIL: particle count"
    );

    passed = false;
}


if (
    snapshot.chamber.radius !==
    0.42
) {

    console.log(
        "FAIL: chamber radius"
    );

    passed = false;
}


for (
    const particle
    of snapshot.particles
) {

    if (
        typeof particle.x !==
            "number" ||

        typeof particle.y !==
            "number" ||

        !particle.id ||

        !particle.species
    ) {

        console.log(
            "FAIL: invalid particle"
        );

        passed = false;

        break;
    }
}


if (passed) {

    console.log(
        "\nPASS: Snapshot contract valid."
    );
}