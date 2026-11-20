class FieldModel {

    constructor(parameters) {

        this.parameters = parameters;
    }


    magneticFieldAt(position) {

        return {
            x: 0,
            y: 0,
            z: this.parameters.magneticField
        };
    }


    electricFieldAt(position) {

        // Version 1:
        // no self-consistent electric field yet.

        return {
            x: 0,
            y: 0,
            z: 0
        };
    }


    getFieldsAt(position) {

        return {

            electric:
                this.electricFieldAt(position),

            magnetic:
                this.magneticFieldAt(position)

        };
    }
}


module.exports = FieldModel;