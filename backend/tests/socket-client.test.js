const { io } =
    require("socket.io-client");


const simulationId =
    process.argv[2];


if (!simulationId) {

    console.error(
        "Usage:"
    );

    console.error(
        "node tests/socket-client.test.js <simulationId>"
    );

    process.exit(1);
}


const socket =
    io(
        "http://localhost:3000"
    );


let snapshotCount = 0;


// ==========================================
// CONNECT
// ==========================================

socket.on(
    "connect",
    () => {

        console.log(
            "Connected:",
            socket.id
        );


        console.log(
            "Subscribing to:",
            simulationId
        );


        socket.emit(
            "simulation.subscribe",
            simulationId
        );
    }
);


// ==========================================
// SUBSCRIPTION CONFIRMATION
// ==========================================

socket.on(
    "simulation.subscribed",
    data => {

        console.log(
            "Subscribed:",
            data
        );

        console.log(
            "\nWaiting for snapshots...\n"
        );
    }
);


// ==========================================
// LIVE SNAPSHOTS
// ==========================================

socket.on(
    "simulation.updated",
    snapshot => {

        snapshotCount++;


        console.log(
            `Snapshot #${snapshotCount}`
        );


        console.log(
            "status:",
            snapshot.status
        );


        console.log(
            "elapsedSeconds:",
            snapshot.elapsedSeconds
        );


        console.log(
            "particles:",
            snapshot.particles.length
        );


        console.log(
            "wall impacts:",
            snapshot.metrics
                .wallImpactCount
        );


        if (
            snapshot.particles.length > 0
        ) {

            console.log(
                "first particle:",
                snapshot.particles[0]
            );
        }


        console.log(
            "----------------------------"
        );


        // We only need a few snapshots
        // for this integration test.

        if (snapshotCount >= 5) {

            console.log(
                "\nPASS: Live snapshots received."
            );


            socket.emit(
                "simulation.unsubscribe",
                simulationId
            );


            socket.disconnect();

            process.exit(0);
        }
    }
);


// ==========================================
// SOCKET ERROR
// ==========================================

socket.on(
    "simulation.error",
    error => {

        console.error(
            "Simulation error:",
            error
        );

        socket.disconnect();

        process.exit(1);
    }
);


socket.on(
    "connect_error",
    error => {

        console.error(
            "Connection error:",
            error.message
        );

        process.exit(1);
    }
);