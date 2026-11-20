class BorisPusher {

    static push(particle, electricField, magneticField, dt) {

        const q = particle.charge;
        const m = particle.mass;

        const qmdt2 = (q * dt) / (2 * m);


        // ==========================================
        // 1. HALF ELECTRIC FIELD ACCELERATION
        // ==========================================

        const vMinus = {

            x:
                particle.velocity.x +
                qmdt2 * electricField.x,

            y:
                particle.velocity.y +
                qmdt2 * electricField.y,

            z:
                particle.velocity.z +
                qmdt2 * electricField.z

        };


        // ==========================================
        // 2. MAGNETIC ROTATION VECTOR
        // ==========================================

        const t = {

            x: qmdt2 * magneticField.x,
            y: qmdt2 * magneticField.y,
            z: qmdt2 * magneticField.z

        };


        const tSquared =
            t.x * t.x +
            t.y * t.y +
            t.z * t.z;


        const s = {

            x: (2 * t.x) / (1 + tSquared),
            y: (2 * t.y) / (1 + tSquared),
            z: (2 * t.z) / (1 + tSquared)

        };


        // ==========================================
        // 3. v' = v- + v- × t
        // ==========================================

        const vPrime = {

            x:
                vMinus.x +
                (
                    vMinus.y * t.z -
                    vMinus.z * t.y
                ),

            y:
                vMinus.y +
                (
                    vMinus.z * t.x -
                    vMinus.x * t.z
                ),

            z:
                vMinus.z +
                (
                    vMinus.x * t.y -
                    vMinus.y * t.x
                )

        };


        // ==========================================
        // 4. v+ = v- + v' × s
        // ==========================================

        const vPlus = {

            x:
                vMinus.x +
                (
                    vPrime.y * s.z -
                    vPrime.z * s.y
                ),

            y:
                vMinus.y +
                (
                    vPrime.z * s.x -
                    vPrime.x * s.z
                ),

            z:
                vMinus.z +
                (
                    vPrime.x * s.y -
                    vPrime.y * s.x
                )

        };


        // ==========================================
        // 5. SECOND HALF ELECTRIC FIELD STEP
        // ==========================================

        particle.velocity.x =
            vPlus.x +
            qmdt2 * electricField.x;

        particle.velocity.y =
            vPlus.y +
            qmdt2 * electricField.y;

        particle.velocity.z =
            vPlus.z +
            qmdt2 * electricField.z;


        // ==========================================
        // 6. UPDATE POSITION
        // ==========================================

        particle.position.x +=
            particle.velocity.x * dt;

        particle.position.y +=
            particle.velocity.y * dt;

        particle.position.z +=
            particle.velocity.z * dt;
    }
}


module.exports = BorisPusher;