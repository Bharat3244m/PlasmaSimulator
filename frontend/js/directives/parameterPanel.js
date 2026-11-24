(function () {

    "use strict";


    angular
        .module("plasmaSimulatorApp")

        .directive(
            "parameterPanel",
            function () {

                return {

                    restrict:
                        "E",

                    scope: {

                        parameters:
                            "=",

                        disabled:
                            "=",

                        onChange:
                            "&"

                    },

                    templateUrl:
                        "templates/parameter-panel.html",

                    controller:
                        [
                            "$scope",
                            "SIMULATION_PRESETS",

                            function (
                                $scope,
                                SIMULATION_PRESETS
                            ) {

                                $scope.presets =
                                    SIMULATION_PRESETS;


                                $scope.notifyChange =
                                    function () {

                                        $scope.onChange(
                                            {
                                                parameters:
                                                    angular.copy(
                                                        $scope.parameters
                                                    )
                                            }
                                        );

                                    };


                                $scope.selectPreset =
                                    function (
                                        preset
                                    ) {

                                        if (
                                            $scope.disabled
                                        ) {

                                            return;

                                        }


                                        $scope.parameters =
                                            angular.copy(
                                                preset.parameters
                                            );


                                        $scope.notifyChange();

                                    };


                                $scope.restoreDefaults =
                                    function () {

                                        $scope.selectPreset(
                                            SIMULATION_PRESETS[0]
                                        );

                                    };

                            }

                        ]

                };

            }
        );

})();