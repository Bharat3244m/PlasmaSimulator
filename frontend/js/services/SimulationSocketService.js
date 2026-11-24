(function () {

    "use strict";


    angular
        .module("plasmaSimulatorApp")

        .factory(
            "SimulationSocketService",
            [
                "$rootScope",
                "API_CONFIG",

                function (
                    $rootScope,
                    API_CONFIG
                ) {

                    var socket =
                        io(
                            API_CONFIG.SOCKET_URL,
                            {
                                autoConnect: true
                            }
                        );


                    var snapshotListeners =
                        [];


                    var errorListeners =
                        [];


                    socket.on(
                        "connect",
                        function () {

                            console.log(
                                "Socket connected:",
                                socket.id
                            );

                        }
                    );


                    socket.on(
                        "disconnect",
                        function (reason) {

                            console.log(
                                "Socket disconnected:",
                                reason
                            );

                        }
                    );


                    socket.on(
                        "simulation.updated",
                        function (snapshot) {

                            $rootScope
                                .$evalAsync(
                                    function () {

                                        snapshotListeners
                                            .forEach(
                                                function (
                                                    callback
                                                ) {

                                                    callback(
                                                        snapshot
                                                    );

                                                }
                                            );

                                    }
                                );

                        }
                    );


                    socket.on(
                        "simulation.error",
                        function (error) {

                            $rootScope
                                .$evalAsync(
                                    function () {

                                        errorListeners
                                            .forEach(
                                                function (
                                                    callback
                                                ) {

                                                    callback(
                                                        error
                                                    );

                                                }
                                            );

                                    }
                                );

                        }
                    );


                    function subscribe(
                        simulationId
                    ) {

                        socket.emit(
                            "simulation.subscribe",
                            simulationId
                        );

                    }


                    function unsubscribe(
                        simulationId
                    ) {

                        socket.emit(
                            "simulation.unsubscribe",
                            simulationId
                        );

                    }


                    function onSnapshot(
                        callback
                    ) {

                        snapshotListeners.push(
                            callback
                        );


                        return function () {

                            var index =
                                snapshotListeners
                                    .indexOf(
                                        callback
                                    );


                            if (index >= 0) {

                                snapshotListeners
                                    .splice(
                                        index,
                                        1
                                    );

                            }

                        };

                    }


                    function onError(
                        callback
                    ) {

                        errorListeners.push(
                            callback
                        );


                        return function () {

                            var index =
                                errorListeners
                                    .indexOf(
                                        callback
                                    );


                            if (index >= 0) {

                                errorListeners
                                    .splice(
                                        index,
                                        1
                                    );

                            }

                        };

                    }


                    return {

                        subscribe:
                            subscribe,

                        unsubscribe:
                            unsubscribe,

                        onSnapshot:
                            onSnapshot,

                        onError:
                            onError,

                        isConnected:
                            function () {

                                return socket.connected;

                            }

                    };

                }

            ]
        );

})();