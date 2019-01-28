const express = require('express');
const app  = express();
const path = require('path');
const mongoose = require('mongoose');
let Article = require('./model/article');
var bodyParser = require('body-parser')
mongoose.connect('mongodb://localhost/extension',{ useNewUrlParser: true });

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let db = mongoose.connection;

 db.on('error',function(error){
    console.log(error);
 });

 db.once('open',function(){
     console.log('Database Connected');
 })

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public')));

app.get('/',function(req,res){
    Article.find({},function(error,articles){
        if(error){
            console.log(error)
        }else{
             res.render('index',{
            article:articles
             });
        }
    });
});

app.get('/article/add',function(req,res){
    res.render('add_article');
});
app.post('/article/add',function(req,res){
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;
    article.save(function(error){
        if(error){
            console.log('error');
        }else{
            res.redirect('/article/add');
        }
    });
});

app.delete('/article/:id',function(req,res){
    let query = {_id:req.params.id}
    Article.remove(query,function(error){
        if(error){
            console.log('Not Deleted');
        }else{
            return res.status(200).send({
                message: 'Deleted'
             });
            // console.log('Deleted');
        }
    })
    // console.log(req.params.id);
})
app.listen(3000,function(){
    console.log('Server Start 3000...');
});