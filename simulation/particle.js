class Particle {

    constructor({
        id,
        species,
        position,
        velocity,
        charge,
        mass
    }) {

        this.id = id;
        this.species = species;

        // Position in metres
        this.position = {
            x: position.x,
            y: position.y,
            z: position.z ?? 0
        };

        // Velocity in metres/second
        this.velocity = {
            x: velocity.x,
            y: velocity.y,
            z: velocity.z ?? 0
        };

        // Coulombs
        this.charge = charge;

        // Kilograms
        this.mass = mass;

        this.active = true;

        this.wallImpactCount = 0;
    }


    clone() {

        return new Particle({
            id: this.id,
            species: this.species,

            position: {
                ...this.position
            },

            velocity: {
                ...this.velocity
            },

            charge: this.charge,
            mass: this.mass
        });
    }
}


module.exports = Particle;