const mongoose = require("mongoose");
const dbConnect = require("./db");
const ApiKey = require("./apikeys");

dbConnect().then(
    () => {
        const user = new ApiKey({user: "fis"});
        user.save(function(error, user) {
            if(error)
            {
                console.log(error);
            }
            else
            {
                console.log("user: "+user.user+", "+user.apikey+" saved.");
            }
        });
    }
);