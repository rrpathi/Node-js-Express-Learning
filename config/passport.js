
const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/users');
const config = require('../config/database');
const bcrypt = require('bcrypt');
module.exports = function(passport){
    passport.use(new LocalStrategy(function(email,password,done){
        let query = {email:email};
        User.findOne(query,function(err,user){
            if(err) throw err;
            if(!user){
                console.log('No User Found');
                return done(null,false,{message:'Nouser Found'});
            }
            bcrypt.compare(password,user.password,function(err,res){
              if(res){
                return done(null, user);
              }else{
                  return done(null, false);

              }
            });

        
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