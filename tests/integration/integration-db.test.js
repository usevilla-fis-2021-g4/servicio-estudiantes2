const Profesor = require("../../profesores");
const mongoose = require("mongoose");
const dbConnect = require("../../db");

describe("DB connection", () => {
    
    beforeAll(() => {
        return dbConnect();
    });
    beforeEach((done) => {
        Profesor.deleteMany({}, (error) => {
            done();
        });
    });

    it("Writes a profesor in the DB", (done) => {
        
        const newProfesor = new Profesor({
            "identificacion": "222222",
            "nombre": "Dos",
            "password": "222222",
            "editable": true
        });

        newProfesor.save((error, profesor) => {
            expect(error).toBeNull();
            Profesor.find({}, (error2, profesores) => {
                expect(profesores).toBeArrayOfSize(1);
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