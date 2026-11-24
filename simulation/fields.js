class FieldModel {

    constructor(parameters) {

        this.parameters =
            parameters;


        /*
         * Reduced-model radial electric field.
         *
         * This is intentionally a prescribed field,
         * not a self-consistent PIC field.
         *
         * The value is chosen so macroscopic E×B
         * drift is visible at chamber scale.
         */

        this.radialElectricField =
            150000; // V/m
    }


    // ==========================================
    // MAGNETIC FIELD
    // ==========================================

    magneticFieldAt(position) {

        return {

            x: 0,

            y: 0,

            z:
                this.parameters
                    .magneticField

        };
    }


    // ==========================================
    // ELECTRIC FIELD
    // ==========================================

    electricFieldAt(position) {

        const x =
            position.x;

        const y =
            position.y;


        const radius =
            Math.sqrt(
                x * x +
                y * y
            );


        /*
         * At the exact centre there is no
         * meaningful radial direction.
         */

        if (radius < 1e-12) {

            return {

                x: 0,

                y: 0,

                z: 0

            };
        }


        /*
         * Unit radial vector:
         *
         * r_hat = (x/r, y/r)
         */

        const nx =
            x / radius;

        const ny =
            y / radius;


        /*
         * Outward radial electric field.
         */

        return {

            x:
                this.radialElectricField *
                nx,

            y:
                this.radialElectricField *
                ny,

            z: 0

        };
    }


    // ==========================================
    // COMBINED FIELD
    // ==========================================

    getFieldsAt(position) {

        return {

            electric:
                this.electricFieldAt(
                    position
                ),

            magnetic:
                this.magneticFieldAt(
                    position
                )

        };
    }

}


module.exports =
    FieldModel;