
const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/users');
const config = require('../config/database');
// const bcrypt = require('bcryptjs');
module.exports = function(passport){
    passport.use(new LocalStrategy(function(username,password,done){
        let query = {username:username};
        User.findOne(query,function(err,user){
            if(err) throw err;
            if(!user){
                console.log('No User Found');
                return done(null,false,{message:'Nouser Found'});
            }

            if (user.password != password) {
              return done(null, false);
            }
            return done(null, user);
        
            // if (!user.validPassword(password)) {
            //     console.log('Wrong password');
            //     return done(null, false, { message: 'Incorrect password.' });
            //   }
              return done(null, user);
        })
    }));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
    
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });
}