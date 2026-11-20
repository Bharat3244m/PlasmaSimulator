class Diagnostics {

    constructor() {

        this.wallImpactCount = 0;

        this.totalSteps = 0;
    }


    recordWallImpact() {

        this.wallImpactCount++;
    }


    recordStep() {

        this.totalSteps++;
    }


    calculate(particles) {

        let totalKineticEnergy = 0;


        for (const particle of particles) {

            if (!particle.active) {
                continue;
            }


            const vx =
                particle.velocity.x;

            const vy =
                particle.velocity.y;

            const vz =
                particle.velocity.z;


            const speedSquared =
                vx * vx +
                vy * vy +
                vz * vz;


            const kineticEnergy =
                0.5 *
                particle.mass *
                speedSquared;


            totalKineticEnergy +=
                kineticEnergy;
        }


        return {

            particleCount:
                particles.filter(
                    particle => particle.active
                ).length,

            wallImpactCount:
                this.wallImpactCount,

            totalKineticEnergy,

            totalSteps:
                this.totalSteps

        };
    }


    reset() {

        this.wallImpactCount = 0;
        this.totalSteps = 0;
    }
}


module.exports = Diagnostics;