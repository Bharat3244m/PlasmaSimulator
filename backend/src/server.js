require("dotenv").config();

const http = require("http");

const { Server } = require("socket.io");

const app = require("./app");

const simulationService = require("./services/simulation.service");

const connectDatabase = require("./config/database");

const PORT = process.env.PORT || 3000;

// ==========================================
// HTTP SERVER
// ==========================================

const server = http.createServer(app);

// ==========================================
// SOCKET.IO
// ==========================================

const io = new Server(server, {
    cors: {
        origin: "http://localhost:4200",

        methods: ["GET", "POST"],
    },
});

// ==========================================
// GIVE SOCKET.IO TO SIMULATION SERVICE
// ==========================================

simulationService.setSocketServer(io);

// ==========================================
// SOCKET CONNECTIONS
// ==========================================

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // ======================================
    // JOIN SIMULATION
    // ======================================

    socket.on("simulation.subscribe", async (simulationId) => {
        try {
            const document = await simulationService.findDocument(simulationId);

            await simulationService.ensureRuntime(document);

            const room = `simulation:${simulationId}`;

            socket.join(room);

            socket.emit("simulation.subscribed", {
                simulationId,
            });
        } catch (error) {
            socket.emit("simulation.error", {
                code: error.code || "SUBSCRIPTION_ERROR",

                message: error.message,
            });
        }
    });

    // ======================================
    // LEAVE SIMULATION
    // ======================================

    socket.on("simulation.unsubscribe", (simulationId) => {
        const room = `simulation:${simulationId}`;

        socket.leave(room);

        console.log(`${socket.id} unsubscribed from ${simulationId}`);
    });

    // ======================================
    // DISCONNECT
    // ======================================

    socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", socket.id, reason);
    });
});

// ==========================================
// START SERVER
// ==========================================

async function startServer() {
    try {
        // Connect database first
        await connectDatabase();

        // Start HTTP + Socket.IO only
        // after database is available.

        server.listen(PORT, () => {
            console.log("================================");

            console.log("Tokamak Simulator Backend");

            console.log("================================");

            console.log(`Server: http://localhost:${PORT}`);

            console.log(`Health: http://localhost:${PORT}/api/health`);

            console.log(`API: http://localhost:${PORT}/api/v1`);

            console.log("Socket.IO: enabled");

            console.log("MongoDB: connected");

            console.log("================================");
        });
    } catch (error) {
        console.error("Backend startup failed.");

        process.exit(1);
    }
}

async function shutdown(signal) {
    console.log(`\n${signal} received. Saving simulations...`);

    try {
        await simulationService.checkpointAll();

        console.log("Simulation summaries saved.");
    } catch (error) {
        console.error(
            "Failed to save some simulation summaries:",
            error.message,
        );
    }

    server.close(() => {
        console.log("HTTP server closed.");

        process.exit(0);
    });

    // Safety fallback.

    setTimeout(() => {
        process.exit(1);
    }, 5000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));

process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
