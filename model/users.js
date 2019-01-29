let mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

let usersSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
         unique: true
    },
    username:{
        type:String,
        required:true 
    },
    password:{
        type:String,
        required:true 
    }

});
usersSchema.plugin(uniqueValidator);

let Users = module.exports =  mongoose.model('users',usersSchema);