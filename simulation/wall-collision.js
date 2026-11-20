class WallCollision {

    static check(particle, chamberRadius) {

        const x = particle.position.x;
        const y = particle.position.y;

        const distanceSquared =
            x * x + y * y;

        const radiusSquared =
            chamberRadius * chamberRadius;


        return distanceSquared >= radiusSquared;
    }


    static handle(particle, chamberRadius) {

        if (!this.check(particle, chamberRadius)) {
            return null;
        }


        const x = particle.position.x;
        const y = particle.position.y;

        const distance =
            Math.sqrt(x * x + y * y);


        // Unit normal pointing outward
        const nx = x / distance;
        const ny = y / distance;


        // Velocity dot normal
        const dot =
            particle.velocity.x * nx +
            particle.velocity.y * ny;


        // Reflect velocity:
        //
        // v' = v - 2(v · n)n

        particle.velocity.x -=
            2 * dot * nx;

        particle.velocity.y -=
            2 * dot * ny;


        // Move slightly inside wall to prevent
        // repeated collision detection.

        const epsilon = 1e-9;

        particle.position.x =
            nx * (chamberRadius - epsilon);

        particle.position.y =
            ny * (chamberRadius - epsilon);


        particle.wallImpactCount++;


        return {

            particleId: particle.id,

            type: "wallImpact",

            position: {
                x: particle.position.x,
                y: particle.position.y
            }

        };
    }
}


module.exports = WallCollision;