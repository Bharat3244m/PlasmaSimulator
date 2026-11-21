class SnapshotSerializer {

    static serialize(
        simulationId,
        engine
    ) {

        const snapshot =
            engine.getSnapshot();


        return {

            schemaVersion: 1,

            simulationId,

            status:
                engine.status,

            elapsedSeconds:
                engine.elapsedSeconds,


            chamber: {

                radius:
                    engine.parameters
                        .chamberRadius

            },


            particles:
                snapshot.particles.map(
                    particle => ({

                        id:
                            particle.id,

                        species:
                            particle.species,

                        x:
                            particle.position.x,

                        y:
                            particle.position.y

                    })
                ),


            events:
                snapshot.events.map(
                    event => ({

                        type:
                            event.type,

                        particleId:
                            event.particleId,

                        x:
                            event.position.x,

                        y:
                            event.position.y

                    })
                ),


            metrics: {

                particleCount:
                    snapshot.metrics
                        .particleCount,

                wallImpactCount:
                    snapshot.metrics
                        .wallImpactCount

            }

        };
    }

}


module.exports =
    SnapshotSerializer;