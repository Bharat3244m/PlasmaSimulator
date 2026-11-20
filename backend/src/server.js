const app =
    require("./app");


const PORT =
    process.env.PORT || 3000;


app.listen(
    PORT,
    () => {

        console.log(
            "================================"
        );

        console.log(
            "Tokamak Simulator Backend"
        );

        console.log(
            "================================"
        );

        console.log(
            `Server: http://localhost:${PORT}`
        );

        console.log(
            `Health: http://localhost:${PORT}/api/health`
        );

        console.log(
            `API: http://localhost:${PORT}/api/v1`
        );

        console.log(
            "================================"
        );

    }
);