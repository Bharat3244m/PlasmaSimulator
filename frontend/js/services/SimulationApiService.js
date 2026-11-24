(function () {

    "use strict";


    angular
        .module("plasmaSimulatorApp")

        .factory(
            "SimulationApiService",
            [
                "$http",
                "API_CONFIG",

                function (
                    $http,
                    API_CONFIG
                ) {


                    function create(
                        parameters
                    ) {

                        return $http.post(

                            API_CONFIG.BASE_URL +
                            "/simulations",

                            {

                                schemaVersion: 1,

                                parameters:
                                    parameters

                            }

                        );

                    }


                    function list() {

                        return $http.get(

                            API_CONFIG.BASE_URL +
                            "/simulations"

                        );

                    }


                    function get(
                        simulationId
                    ) {

                        return $http.get(

                            API_CONFIG.BASE_URL +
                            "/simulations/" +
                            simulationId

                        );

                    }


                    function action(
                        simulationId,
                        actionName
                    ) {

                        return $http.post(

                            API_CONFIG.BASE_URL +
                            "/simulations/" +
                            simulationId +
                            "/actions",

                            {

                                action:
                                    actionName

                            }

                        );

                    }


                    function results(
                        simulationId
                    ) {

                        return $http.get(

                            API_CONFIG.BASE_URL +
                            "/simulations/" +
                            simulationId +
                            "/results"

                        );

                    }


                    function update(
                        simulationId,
                        changes
                    ) {

                        return $http.put(

                            API_CONFIG.BASE_URL +
                            "/simulations/" +
                            simulationId,

                            changes

                        );

                    }


                    function remove(
                        simulationId
                    ) {

                        return $http.delete(

                            API_CONFIG.BASE_URL +
                            "/simulations/" +
                            simulationId

                        );

                    }


                    return {

                        create: create,

                        list: list,

                        get: get,

                        action: action,

                        results: results,

                        update: update,

                        remove: remove

                    };

                }

            ]
        );

})();