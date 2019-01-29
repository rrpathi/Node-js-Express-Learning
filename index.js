const express = require('express');
const app  = express();
const path = require('path');
const mongoose = require('mongoose');
let Article = require('./model/article');
let Users = require('./model/users');
var bodyParser = require('body-parser');
const config = require('./config/database');
const passport = require('passport');
const session = require('express-session');
app.use(session({secret: 'Secret',saveUninitialized: false,resave: false}));

app.use(passport.initialize());
// app.use(passport.session());


mongoose.connect(config.database);

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
// res.render('registration', {error: false});

app.get('/',function(req,res){
    if(req.session.user_id == undefined){
        res.redirect('/user/login');
    }else{
           Article.find({'user_id':req.session.user_id},function(error,articles){
        if(error){
            console.log(error)
        }else{
             res.render('index',{
            article:articles
             });
        }
    });
    }
 
});

app.use(function(req, res, next) {
  res.data = 'Hello';
  next();
});


app.get('/article/add',function(req,res){
    console.log(req.session.user_id);
    if(req.session.user_id == undefined){
        res.redirect('/user/login');
    }else{
        res.render('add_article');
    }
});
app.post('/article/add',function(req,res){
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;
    article.user_id = req.session.user_id;
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
});
app.get('/user/register',function(req,res){
    res.render('register');
});

app.post('/user/register',function(req,res){
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    let newUser = new Users({'name':name,'email':email,'username':username,'password':password});
    newUser.save(function(err){
        if(err){
            console.log('Not Register');
        }else{
            res.redirect('/user/login');
            // console.log('Register Successfully');
        }
    });
});

// Passport Config
require('./config/passport')(passport);
// Passport Middleware


app.get('/user/login',function(req,res){
    res.render('login');
});

app.get('/user/logout',function(req,res){
    req.session.destroy();
    res.redirect('/user/login');
});

app.get('/download',function(req,res){
    if(req.session.user_id == undefined){
        res.redirect('/user/login');
    }else{
        res.render('download');
    }

});

// app.post('/user/login', function(req, res, next){
//     passport.authenticate('local', {
//       successRedirect:'/',
//       failureRedirect:'/user/login',
//     //   failureFlash: true
//     })(req, res, next);
//     console.log('logged in');
//     console.log(req.session);
//   });

app.post('/user/login', 
  passport.authenticate('local', { failureRedirect: '/error' }),
  function(req, res) {
    req.session.user_id = req.session.passport.user;
    res.redirect('/article/add');
    // res.render('');
    // console.log(req.session);
    // req.session.email = req.user.username;
    // console.log(req.session.email); 
    // res.redirect('/success?username='+req.user.username);
  });

// app.get('*',function(req,res){
//     if (req.user) {
//         console.log('log in')
//       // logged in
//   } else {
//       console.log('out')
//   }
// });
app.get('/api/login',function(req,res){
    res.send('Hello');
});

app.listen(3000,function(){
    console.log('Server Start 3000...');
});