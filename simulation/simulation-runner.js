class SimulationRunner {

    constructor(
        engine,
        options = {}
    ) {

        this.engine = engine;

        // How often JavaScript wakes up.
        //
        // 60 Hz ≈ 16.67 ms
        this.updateRate =
            options.updateRate || 60;


        // Number of physics steps performed
        // during each update.
        //
        // We deliberately separate this from
        // rendering/network frequency.
        this.stepsPerUpdate =
            options.stepsPerUpdate || 100;


        this.interval = null;

        this.running = false;


        this.onSnapshot =
            options.onSnapshot || null;
    }


    // ==========================================
    // START
    // ==========================================

    start() {

        if (this.running) {
            return;
        }


        this.running = true;


        const intervalMs =
            1000 / this.updateRate;


        this.interval =
            setInterval(
                () => {

                    this.tick();

                },
                intervalMs
            );
    }


    // ==========================================
    // UPDATE
    // ==========================================

    tick() {

        if (!this.running) {
            return;
        }


        if (
            this.engine.status !==
            "running"
        ) {

            return;
        }


        for (
            let i = 0;
            i < this.stepsPerUpdate;
            i++
        ) {

            this.engine.step();
        }


        if (this.onSnapshot) {

            const snapshot =
                this.engine.getSnapshot();


            this.onSnapshot(
                snapshot
            );
        }
    }


    // ==========================================
    // PAUSE
    // ==========================================

    pause() {

        if (!this.running) {
            return;
        }


        clearInterval(
            this.interval
        );


        this.interval = null;

        this.running = false;
    }


    // ==========================================
    // STOP
    // ==========================================

    stop() {

        this.pause();
    }


    // ==========================================
    // CLEANUP
    // ==========================================

    destroy() {

        this.stop();

        this.onSnapshot = null;
    }
}


module.exports =
    SimulationRunner;