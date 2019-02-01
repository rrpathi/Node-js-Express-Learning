const express = require('express');
const app  = express();
const path = require('path');
const mongoose = require('mongoose');
let Article = require('./model/article');
let Users = require('./model/users');
let URL = require('./model/url');
const bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
const config = require('./config/database');
const passport = require('passport');
// const bcrypt = require('bcryptjs');
const session = require('express-session');
app.use(session({secret: 'Secret',saveUninitialized: false,resave: false}));
var jwt = require('jsonwebtoken');

app.use(passport.initialize());
// app.use(passport.session());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  
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

function validateSession(req,res,next){
    if(req.session.user_id == undefined){
        res.redirect('/user/login');
    }else{
        next();
    }
}

app.get('/',validateSession,function(req,res){
           Article.find({'user_id':req.session.user_id},function(error,articles){
        if(error){
            console.log(error)
        }else{
             res.render('index',{
            article:articles
             });
        }
    });
 
});



app.get('/article/add',validateSession,function(req,res){
    // console.log(req.session.user_id);
   
        res.render('add_article');
});

app.get('/view/url',validateSession,function(req,res){
    // console.log(req.session.user_id);
        URL.find({'user_id':req.session.user_id},function(error,urls){
            if(error){
                console.log(error)
            }else{
                 res.render('url',{
                urls:urls
                 });
            }
        });
});


app.post('/article/add',function(req,res){
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;
    article.user_id = req.session.user_id;
    // article.save(function(error){
    //     if(error){
    //         console.log('error');
    //     }else{
    //         res.redirect('/article/add');
    //     }
    // });
    article.save().then(function(){
        res.redirect('/article/add');
    }).catch(function(error){
        console.log(error);
    })
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
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);


    let newUser = new Users({'name':name,'email':email,'username':username,'password':hash});
    newUser.save().then(function(){
        res.redirect('/user/login');
    }).catch(function(error){
        console.log('Not Register');
    });
});

app.post('/api/login',function(req,res){
    // res.send(req.body.email);
    Users.findOne({email:req.body.email},function(err,user){
        // res.send('Hello');
        if(!user){
            res.send('User Not Exist');
        }else{
            bcrypt.compare(req.body.password,user.password,function(err,result){
                if(result){
                    const JWTToken = jwt.sign({email:user.email,_id:user._id},'secret');
                    return res.status(200).send({status:'ok',token:JWTToken});
                }else{
                    res.send('Wrong Password');
                }
              });

        }
    });
});

app.post('/api/post',verifyToken,function(req,res){
    jwt.verify(req.token, 'secret', (err, authData) => {
        if(err) {
          res.send('Check Your Bearer Token');
        } else {
          res.json({
            message: 'Post created...',
            authData
          });
        }
      });

});

function verifyToken(req,res,next){
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }else{
        res.send('Error');
    }   

}

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

app.get('/download',validateSession,function(req,res){
        res.render('download');
});



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
app.post('/api/addArticle',function(req,res){
    jwt.verify(req.body.jwt_token, 'secret', (err, authData) => {
        if(err) {
          res.send('Check Your Bearer Token');
        } else {
            let url = new URL();
            url.url = req.body.articleUrl;
            url.user_id = authData._id;
            url.save(function(error){
        if(error){
            res.send(error);
        }else{
           res.send('Url  Saved');
        }
    });
           
         
        }
      });

});



app.listen(3000,function(){
    console.log('Server Start 3000...');
});