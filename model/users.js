let mongoose = require('mongoose');

let usersSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
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

let Users = module.exports =  mongoose.model('users',usersSchema);