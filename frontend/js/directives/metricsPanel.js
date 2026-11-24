(function () {

    "use strict";


    angular
        .module("plasmaSimulatorApp")

        .directive(
            "metricsPanel",
            function () {

                return {

                    restrict:
                        "E",

                    scope: {

                        metrics:
                            "=",

                        elapsedSeconds:
                            "="

                    },

                    templateUrl:
                        "templates/metrics-panel.html",


                    link:
                        function (scope) {

                            scope.elapsedMicroseconds =
                                0;


                            scope.$watch(
                                "elapsedSeconds",
                                function (value) {

                                    scope.elapsedMicroseconds =
                                        (
                                            Number(value) ||
                                            0
                                        ) *
                                        1000000;

                                }
                            );

                        }

                };

            }
        );

})();