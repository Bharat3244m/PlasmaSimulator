const express =
    require("express");

const cors =
    require("cors");

const simulationRoutes =
    require("./routes/simulations.routes");

const errorHandler =
    require("./middleware/error-handler");


const app =
    express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
    cors({

        origin:
            "http://localhost:4200"

    })
);


app.use(
    express.json()
);


// ==========================================
// HEALTH
// ==========================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            status: "ok",

            service:
                "tokamak-simulator-backend",

            timestamp:
                new Date().toISOString()

        });

    }
);


// ==========================================
// API V1
// ==========================================

app.use(
    "/api/v1",
    simulationRoutes
);


// ==========================================
// 404
// ==========================================

app.use(
    (req, res) => {

        res.status(404).json({

            error: {

                code:
                    "ROUTE_NOT_FOUND",

                message:
                    "API route not found"

            }

        });

    }
);


// ==========================================
// ERROR HANDLER
// ==========================================

app.use(errorHandler);


module.exports = app;