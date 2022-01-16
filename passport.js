const passport = require("passport");
const LocalApiKey = require("passport-localapikey-update").Strategy;
const ApiKey = require("./apikeys");

passport.use(new LocalApiKey(
    (apikey, done) => {
        ApiKey.findOne({apikey: apikey}, (error, user) => {
            
            if(error)
            { 
                return done(error);
            }

            if(!user)
            {
                return done(null, false, {message: "Unknonwn apikey "+apikey});
            }
            else
            {
                console.log("Logged as user "+user.user);
                return done(null, user);
            }

        })
    }
));