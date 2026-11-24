(function () {

    "use strict";


    angular
        .module("plasmaSimulatorApp")

        .factory(
            "SimulationModels",
            function () {


                function defaultParameters() {

                    return {

                        magneticField: 2.4,

                        electronDensity: 4.8,

                        electronTemperature: 125,

                        ionTemperature: 38,

                        chamberRadius: 0.42

                    };

                }


                function emptySimulation() {

                    return {

                        schemaVersion: 1,

                        simulationId: null,

                        name: "",

                        description: "",

                        status: "idle",

                        elapsedSeconds: 0,

                        parameters:
                            defaultParameters(),

                        createdAt: null,

                        updatedAt: null,

                        startedAt: null,

                        completedAt: null

                    };

                }


                function emptyMetrics() {

                    return {

                        particleCount: 0,

                        wallImpactCount: 0,

                        peakDensity: null,

                        energyConfinementMs:
                            null

                    };

                }


                return {

                    defaultParameters:
                        defaultParameters,

                    emptySimulation:
                        emptySimulation,

                    emptyMetrics:
                        emptyMetrics

                };

            }
        );

})();