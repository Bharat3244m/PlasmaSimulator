const Particle =
    require("../particle");

const FieldModel =
    require("../fields");

const BorisPusher =
    require("../boris-pusher");

const PHYSICS =
    require("../constants");


const parameters = {

    magneticField: 2.4,

    electronDensity: 4.8,

    electronTemperature: 125,

    ionTemperature: 38,

    chamberRadius: 0.42

};


const fields =
    new FieldModel(
        parameters
    );


const particle =
    new Particle({

        id:
            "drift-test",

        species:
            "deuterium",

        position: {

            x: 0.2,

            y: 0,

            z: 0

        },

        velocity: {

            x: 0,

            y: 0,

            z: 0

        },

        charge:
            PHYSICS
                .ELEMENTARY_CHARGE,

        mass:
            PHYSICS
                .DEUTERIUM_MASS

    });


const initialAngle =
    Math.atan2(

        particle.position.y,

        particle.position.x

    );


const dt =
    1e-10;


const STEPS =
    100000;


for (
    let i = 0;
    i < STEPS;
    i++
) {

    const field =
        fields.getFieldsAt(
            particle.position
        );


    BorisPusher.push(

        particle,

        field.electric,

        field.magnetic,

        dt

    );

}


const finalAngle =
    Math.atan2(

        particle.position.y,

        particle.position.x

    );


console.log(
    "\n=============================="
);

console.log(
    "E x B DRIFT TEST"
);

console.log(
    "=============================="
);


console.log(
    "Initial angle:",
    initialAngle
);


console.log(
    "Final angle:",
    finalAngle
);


console.log(
    "Final position:",
    particle.position
);


console.log(
    "Angular change:",
    finalAngle -
    initialAngle
);


if (
    Math.abs(
        finalAngle -
        initialAngle
    ) > 0.001
) {

    console.log(
        "\nPASS: Guiding centre drift detected."
    );

} else {

    console.log(
        "\nFAIL: No significant drift detected."
    );
}