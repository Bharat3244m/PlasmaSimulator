function errorHandler(
    err,
    req,
    res,
    next
) {

    console.error(err);


    const status =
        err.status || 500;


    const code =
        err.code ||
        "INTERNAL_SERVER_ERROR";


    const response = {

        error: {

            code,

            message:
                err.message ||
                "Internal server error"

        }

    };


    if (err.fields) {

        response.error.fields =
            err.fields;
    }


    res.status(status)
        .json(response);
}


module.exports =
    errorHandler;