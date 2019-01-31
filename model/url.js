let mongoose = require('mongoose');

let urlSchema = mongoose.Schema({
    user_id:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    }
});

let Url = module.exports =  mongoose.model('url',urlSchema);