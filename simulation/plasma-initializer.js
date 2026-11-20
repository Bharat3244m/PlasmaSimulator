const Particle =
    require("./particle");

const PHYSICS =
    require("./constants");


class PlasmaInitializer {

    static createPopulation(
        parameters,
        options = {}
    ) {

        const electronCount =
            options.electronCount ?? 150;

        const ionCount =
            options.ionCount ?? 150;


        const particles = [];


        // ======================================
        // MACROPARTICLE WEIGHT
        // ======================================

        /*
         * Contract:
         *
         * electronDensity is expressed in
         * units of 10^19 m^-3.
         */

        const densitySI =
            parameters.electronDensity *
            1e19;


        /*
         * This is a reduced 2D educational
         * simulation.
         *
         * For the macroparticle estimate we
         * assign a simple spherical reference
         * volume based on chamberRadius.
         *
         * This weight is metadata describing
         * how many physical particles one
         * computational particle represents.
         */

        const volume =
            (4 / 3) *
            Math.PI *
            Math.pow(
                parameters.chamberRadius,
                3
            );


        const estimatedElectrons =
            densitySI * volume;


        const electronWeight =
            electronCount > 0
                ? estimatedElectrons /
                  electronCount
                : 0;


        // Quasi-neutral initialization:
        // approximately equal electron and
        // deuterium-ion number density.

        const ionWeight =
            ionCount > 0
                ? estimatedElectrons /
                  ionCount
                : 0;


        // ======================================
        // ELECTRONS
        // ======================================

        for (
            let i = 0;
            i < electronCount;
            i++
        ) {

            particles.push(

                this.createParticle({

                    id:
                        `electron-${i + 1}`,

                    species:
                        "electron",

                    temperatureEv:
                        parameters
                            .electronTemperature,

                    chamberRadius:
                        parameters
                            .chamberRadius,

                    charge:
                        -PHYSICS
                            .ELEMENTARY_CHARGE,

                    mass:
                        PHYSICS
                            .ELECTRON_MASS,

                    weight:
                        electronWeight

                })

            );
        }


        // ======================================
        // DEUTERIUM IONS
        // ======================================

        for (
            let i = 0;
            i < ionCount;
            i++
        ) {

            particles.push(

                this.createParticle({

                    id:
                        `deuterium-${i + 1}`,

                    species:
                        "deuterium",

                    temperatureEv:
                        parameters
                            .ionTemperature,

                    chamberRadius:
                        parameters
                            .chamberRadius,

                    charge:
                        PHYSICS
                            .ELEMENTARY_CHARGE,

                    mass:
                        PHYSICS
                            .DEUTERIUM_MASS,

                    weight:
                        ionWeight

                })

            );
        }


        return particles;
    }


    // ==========================================
    // CREATE SINGLE PARTICLE
    // ==========================================

    static createParticle({

        id,
        species,
        temperatureEv,
        chamberRadius,
        charge,
        mass,
        weight

    }) {

        const position =
            this.randomPosition(
                chamberRadius
            );


        const velocity =
            this.thermalVelocity(
                temperatureEv,
                mass
            );


        return new Particle({

            id,
            species,
            position,
            velocity,
            charge,
            mass,
            weight

        });
    }


    // ==========================================
    // RANDOM POSITION
    // ==========================================

    static randomPosition(
        chamberRadius
    ) {

        /*
         * Uniform distribution over a disk.
         *
         * Using sqrt(random) is important.
         * Using r = random * R would
         * concentrate particles near the centre.
         */

        const radius =
            chamberRadius *
            0.75 *
            Math.sqrt(
                Math.random()
            );


        const angle =
            Math.random() *
            Math.PI *
            2;


        return {

            x:
                radius *
                Math.cos(angle),

            y:
                radius *
                Math.sin(angle),

            z: 0

        };
    }


    // ==========================================
    // THERMAL VELOCITY
    // ==========================================

    static thermalVelocity(
        temperatureEv,
        mass
    ) {

        /*
         * For one Cartesian component of a
         * Maxwellian distribution:
         *
         * sigma = sqrt(kT / m)
         *
         * Since temperature is supplied in eV,
         *
         * kT = T_eV * e
         */

        const thermalSigma =
            Math.sqrt(

                (
                    temperatureEv *
                    PHYSICS.EV_TO_JOULES
                )
                /
                mass

            );


        return {

            x:
                this.gaussianRandom() *
                thermalSigma,

            y:
                this.gaussianRandom() *
                thermalSigma,

            z:
                this.gaussianRandom() *
                thermalSigma

        };
    }


    // ==========================================
    // STANDARD NORMAL RANDOM NUMBER
    // ==========================================

    static gaussianRandom() {

        /*
         * Box-Muller transform.
         *
         * Produces approximately:
         *
         * mean = 0
         * standard deviation = 1
         */

        let u = 0;
        let v = 0;


        while (u === 0) {

            u = Math.random();
        }


        while (v === 0) {

            v = Math.random();
        }


        return (

            Math.sqrt(
                -2 *
                Math.log(u)
            )
            *
            Math.cos(
                2 *
                Math.PI *
                v
            )

        );
    }

}


module.exports =
    PlasmaInitializer;