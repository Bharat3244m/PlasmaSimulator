const mongoose =
    require("mongoose");


async function connectDatabase() {

    const uri =
        process.env.MONGODB_URI;


    if (!uri) {

        throw new Error(
            "MONGODB_URI is not defined"
        );
    }


    try {

        await mongoose.connect(uri);


        console.log(
            "MongoDB connected successfully"
        );


        console.log(
            `Database: ${mongoose.connection.name}`
        );

    } catch (error) {

        console.error(
            "MongoDB connection failed:"
        );

        console.error(
            error.message
        );


        throw error;
    }
}


module.exports =
    connectDatabase;