const mongoose = require('mongoose');
const DB_URL = (process.env.MONGO_URL_SERVICIO_PROFESORES || 'mongodb://db/test');//local y mongo atlas
//const DB_URL = process.env.MONGO_URL_SERVICIO_PROFESORES || "mongodb://mongodb:27017";//okteto

const dbConnect = function(){
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error: '));
    return mongoose.connect(DB_URL, { useNewUrlParser: true });
}



module.exports = dbConnect;
