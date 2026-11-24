(function () {

    "use strict";


    var backendHost =
        window.location.hostname;


    angular
        .module(
            "plasmaSimulatorApp"
        )

        .constant(
            "API_CONFIG",
            {

                BASE_URL:
                    "http://" +
                    backendHost +
                    ":3000/api/v1",

                SOCKET_URL:
                    "http://" +
                    backendHost +
                    ":3000"

            }
        );

})();