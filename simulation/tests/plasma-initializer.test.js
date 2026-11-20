const PlasmaInitializer =
    require("../plasma-initializer");


const parameters = {

    magneticField: 2.4,

    electronDensity: 4.8,

    electronTemperature: 125,

    ionTemperature: 38,

    chamberRadius: 0.42

};


const particles =
    PlasmaInitializer
        .createPopulation(
            parameters,
            {
                electronCount: 5000,
                ionCount: 5000
            }
        );


const electrons =
    particles.filter(
        p =>
            p.species ===
            "electron"
    );


const ions =
    particles.filter(
        p =>
            p.species ===
            "deuterium"
    );


function speed(particle) {

    return Math.sqrt(

        particle.velocity.x ** 2 +
        particle.velocity.y ** 2 +
        particle.velocity.z ** 2

    );
}


function averageSpeed(array) {

    const total =
        array.reduce(
            (sum, particle) =>
                sum +
                speed(particle),
            0
        );


    return total /
        array.length;
}


const averageElectronSpeed =
    averageSpeed(electrons);


const averageIonSpeed =
    averageSpeed(ions);


const outsideParticles =
    particles.filter(
        particle => {

            const r =
                Math.sqrt(

                    particle.position.x ** 2 +
                    particle.position.y ** 2

                );


            return (
                r >=
                parameters.chamberRadius
            );
        }
    );


console.log(
    "\n=============================="
);

console.log(
    "PLASMA INITIALIZER TEST"
);

console.log(
    "=============================="
);


console.log(
    "Total particles:",
    particles.length
);


console.log(
    "Electrons:",
    electrons.length
);


console.log(
    "Deuterium ions:",
    ions.length
);


console.log(
    "\nAverage electron speed:",
    averageElectronSpeed,
    "m/s"
);


console.log(
    "Average ion speed:",
    averageIonSpeed,
    "m/s"
);


console.log(
    "\nParticles outside chamber:",
    outsideParticles.length
);


console.log(
    "\nElectron macroparticle weight:",
    electrons[0].weight
);


console.log(
    "Ion macroparticle weight:",
    ions[0].weight
);


// ==========================================
// TESTS
// ==========================================

let passed = true;


if (
    electrons.length !== 5000 ||
    ions.length !== 5000
) {

    console.log(
        "\nFAIL: Incorrect particle count."
    );

    passed = false;
}


if (
    outsideParticles.length !== 0
) {

    console.log(
        "\nFAIL: Particles generated outside chamber."
    );

    passed = false;
}


if (
    averageElectronSpeed <=
    averageIonSpeed
) {

    console.log(
        "\nFAIL: Expected electrons to have higher thermal speed."
    );

    passed = false;
}


if (
    !Number.isFinite(
        electrons[0].weight
    )
) {

    console.log(
        "\nFAIL: Invalid macroparticle weight."
    );

    passed = false;
}


if (passed) {

    console.log(
        "\nPASS: Plasma initialization looks valid."
    );
}