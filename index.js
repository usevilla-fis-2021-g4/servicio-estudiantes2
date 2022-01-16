const app = require("./server");
var dbConnect = require('./db');

var port = ( process.env.PORT || 3000 );

console.log("Starting API server at "+port);

dbConnect().then(
    () => {
        app.listen(port);
        console.log("Server ready!");
    },
    err => {
        console.log("Connection error: "+err);
    }
);