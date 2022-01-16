const mongoose = require('mongoose');

const profesorSchema = new mongoose.Schema({
    identificacion: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    editable: {
        type: Boolean,
        required: true
    },
    imagenIdentificacion: {
        type: String,
        required: false
    },
});

profesorSchema.methods.limpiar = function(){
    //return this;
    return {_id: this._id, identificacion: this.identificacion, nombre: this.nombre, editable: this.editable, imagenIdentificacion: this.imagenIdentificacion};
}

const Profesor = mongoose.model('Profesor', profesorSchema);

module.exports = Profesor;