(function () {
    "use strict";

    angular
        .module("plasmaSimulatorApp")

        .controller("SimulatorController", [
            "$scope",
            "SimulationModels",
            "SimulationApiService",
            "SimulationSocketService",

            function (
                $scope,
                SimulationModels,
                SimulationApiService,
                SimulationSocketService,
            ) {
                // =========================
                // STATE
                // =========================

                $scope.parameters = SimulationModels.defaultParameters();

                $scope.simulation = SimulationModels.emptySimulation();

                $scope.metrics = SimulationModels.emptyMetrics();

                $scope.latestSnapshot = null;

                $scope.loading = false;

                $scope.errorMessage = null;

                $scope.elapsedMicroseconds = 0;

                // =========================
                // PARAMETER UPDATE
                // =========================

                $scope.updateParameters = function (parameters) {
                    if ($scope.simulation.status === "running") {
                        return;
                    }

                    $scope.parameters = angular.copy(parameters);

                    /*
                     * If a simulation
                     * already exists,
                     * parameters changed.
                     *
                     * Create a fresh
                     * simulation on the
                     * next Run.
                     */

                    if ($scope.simulation.simulationId) {
                        SimulationSocketService.unsubscribe(
                            $scope.simulation.simulationId,
                        );

                        $scope.simulation = SimulationModels.emptySimulation();

                        $scope.latestSnapshot = null;

                        $scope.metrics = SimulationModels.emptyMetrics();
                    }
                };

                // =========================
                // CREATE
                // =========================

                function createSimulation() {
                    $scope.loading = true;

                    $scope.errorMessage = null;

                    return SimulationApiService.create($scope.parameters)

                        .then(function (response) {
                            $scope.simulation = response.data;

                            SimulationSocketService.subscribe(
                                response.data.simulationId,
                            );

                            return response.data;
                        })

                        .catch(handleHttpError)

                        .finally(function () {
                            $scope.loading = false;
                        });
                }

                // =========================
                // START
                // =========================

                $scope.startSimulation = function () {
                    $scope.errorMessage = null;

                    if (!$scope.simulation.simulationId) {
                        createSimulation().then(function (simulation) {
                            if (simulation) {
                                performAction("start");
                            }
                        });

                        return;
                    }

                    performAction("start");
                };

                // =========================
                // PAUSE
                // =========================

                $scope.pauseSimulation = function () {
                    if (!$scope.simulation.simulationId) {
                        return;
                    }

                    performAction("pause");
                };

                // =========================
                // RESET
                // =========================

                $scope.resetSimulation = function () {
                    if (!$scope.simulation.simulationId) {
                        resetLocalState();

                        return;
                    }

                    performAction("reset").then(function () {
                        $scope.latestSnapshot = null;

                        $scope.metrics = SimulationModels.emptyMetrics();
                    });
                };

                // =========================
                // ACTION
                // =========================

                function performAction(actionName) {
                    $scope.loading = true;

                    $scope.errorMessage = null;

                    return SimulationApiService.action(
                        $scope.simulation.simulationId,

                        actionName,
                    )

                        .then(function (response) {
                            $scope.simulation = response.data;

                            return response.data;
                        })

                        .catch(handleHttpError)

                        .finally(function () {
                            $scope.loading = false;
                        });
                }

                // =========================
                // SOCKET SNAPSHOTS
                // =========================

                var removeSnapshotListener = SimulationSocketService.onSnapshot(
                    function (snapshot) {
                        if (
                            snapshot.simulationId !==
                            $scope.simulation.simulationId
                        ) {
                            return;
                        }

                        $scope.latestSnapshot = snapshot;

                        $scope.simulation.status = snapshot.status;

                        $scope.simulation.elapsedSeconds =
                            snapshot.elapsedSeconds;

                        $scope.elapsedMicroseconds =
                            snapshot.elapsedSeconds * 1000000;

                        $scope.metrics.particleCount =
                            snapshot.metrics.particleCount;

                        $scope.metrics.wallImpactCount =
                            snapshot.metrics.wallImpactCount;
                    },
                );

                var removeErrorListener = SimulationSocketService.onError(
                    function (error) {
                        $scope.errorMessage =
                            error.message || "Simulation socket error";
                    },
                );

                // =========================
                // HELPERS
                // =========================

                $scope.getElapsedMicroseconds = function () {
                    return ($scope.simulation.elapsedSeconds || 0) * 1000000;
                };

                $scope.getStatusLabel = function () {
                    switch ($scope.simulation.status) {
                        case "running":
                            return "Simulation active";

                        case "paused":
                            return "Simulation paused";

                        case "failed":
                            return "Simulation failed";

                        default:
                            return "Ready";
                    }
                };

                $scope.clearError = function () {
                    $scope.errorMessage = null;
                };

                function resetLocalState() {
                    $scope.simulation = SimulationModels.emptySimulation();

                    $scope.latestSnapshot = null;

                    $scope.metrics = SimulationModels.emptyMetrics();
                }

                function handleHttpError(error) {
                    var data = error.data;

                    if (data && data.error) {
                        $scope.errorMessage = data.error.message;
                    } else {
                        $scope.errorMessage =
                            "Unable to communicate with backend.";
                    }

                    console.error("Backend error:", error);

                    return null;
                }

                // =========================
                // CLEANUP
                // =========================

                $scope.$on("$destroy", function () {
                    if ($scope.simulation.simulationId) {
                        SimulationSocketService.unsubscribe(
                            $scope.simulation.simulationId,
                        );
                    }

                    removeSnapshotListener();

                    removeErrorListener();
                });
            },
        ]);
})();
