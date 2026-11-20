class Particle {

    constructor({
        id,
        species,
        position,
        velocity,
        charge,
        mass,
        weight = 1
    }) {

        this.id = id;

        this.species =
            species;


        this.position = {

            x: position.x,
            y: position.y,
            z: position.z ?? 0

        };


        this.velocity = {

            x: velocity.x,
            y: velocity.y,
            z: velocity.z ?? 0

        };


        this.charge =
            charge;

        this.mass =
            mass;


        // Number of physical particles
        // represented by this computational
        // particle.

        this.weight =
            weight;


        this.active =
            true;

        this.wallImpactCount =
            0;
    }


    clone() {

        return new Particle({

            id:
                this.id,

            species:
                this.species,

            position: {
                ...this.position
            },

            velocity: {
                ...this.velocity
            },

            charge:
                this.charge,

            mass:
                this.mass,

            weight:
                this.weight

        });
    }

}


module.exports =
    Particle;