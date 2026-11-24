function isAllowedOrigin(origin) {

    // Requests such as curl/Postman may not
    // contain an Origin header.
    if (!origin) {
        return true;
    }


    // localhost
    if (
        /^http:\/\/localhost:\d+$/
            .test(origin)
    ) {
        return true;
    }


    // 127.0.0.1
    if (
        /^http:\/\/127\.0\.0\.1:\d+$/
            .test(origin)
    ) {
        return true;
    }


    // Private 192.168.x.x network
    if (
        /^http:\/\/192\.168\.\d+\.\d+:\d+$/
            .test(origin)
    ) {
        return true;
    }


    return false;
}


const corsOptions = {

    origin:
        function (
            origin,
            callback
        ) {

            if (
                isAllowedOrigin(origin)
            ) {

                callback(
                    null,
                    true
                );

                return;
            }


            callback(
                new Error(
                    "Origin not allowed by CORS"
                )
            );

        },

    methods: [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ]

};


module.exports = {

    corsOptions,

    isAllowedOrigin

};