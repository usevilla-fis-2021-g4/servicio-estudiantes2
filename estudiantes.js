const mongoose = require('mongoose');

const estudianteSchema = new mongoose.Schema({
    identificacion: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        required: true
    }
});

estudianteSchema.methods.limpiar = function(){
    //return this;
    return {_id: this._id, identificacion: this.identificacion, nombre: this.nombre};
}

const Estudiante = mongoose.model('Estudiante', estudianteSchema);

module.exports = Estudiante;