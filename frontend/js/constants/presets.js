(function () {

    "use strict";


    angular
        .module("plasmaSimulatorApp")

        .constant(
            "SIMULATION_PRESETS",
            [

                {

                    name:
                        "Tokamak Edge",

                    description:
                        "High-field warm plasma",

                    parameters: {

                        magneticField: 2.4,

                        electronDensity: 4.8,

                        electronTemperature: 125,

                        ionTemperature: 38,

                        chamberRadius: 0.42

                    }

                },


                {

                    name:
                        "Low Temperature",

                    description:
                        "Lower-energy plasma",

                    parameters: {

                        magneticField: 0.18,

                        electronDensity: 0.65,

                        electronTemperature: 8,

                        ionTemperature: 1.5,

                        chamberRadius: 0.18

                    }

                },


                {

                    name:
                        "Dense Core",

                    description:
                        "High-density plasma",

                    parameters: {

                        magneticField: 5.1,

                        electronDensity: 11.2,

                        electronTemperature: 310,

                        ionTemperature: 94,

                        chamberRadius: 0.31

                    }

                }

            ]
        );

})();