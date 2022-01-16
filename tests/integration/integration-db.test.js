const Estudiante = require("../../estudiantes");
const mongoose = require("mongoose");
const dbConnect = require("../../db");

describe("DB connection", () => {
    
    beforeAll(() => {
        return dbConnect();
    });
    beforeEach((done) => {
        Estudiante.deleteMany({}, (error) => {
            done();
        });
    });

    it("Writes a estudiante in the DB", (done) => {
        
        const newEstudiante = new Estudiante({
            "identificacion": "222222",
            "nombre": "Dos",
        
        });

        newEstudiante.save((error, estudiante) => {
            expect(error).toBeNull();
            Estudiante.find({}, (error2, estudiantes) => {
                expect(estudiantes).toBeArrayOfSize(1);
                done();
            })
        });

    });

    afterAll((done) => {
        mongoose.connection.db.dropDatabase(() => {
            mongoose.connection.close(done);
        });
    });

});