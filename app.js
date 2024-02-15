const express = require('express');
const bodyParser=require('body-parser');
const ejs=require('ejs');
const mongoose = require('mongoose');
const encrypt=require('mongoose-encryption');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app=express();
// Set up view engine and static folder
app.set('view engine','ejs');
app.use(express.static('public'));
// Body parser middleware
app.use(express.urlencoded({extended:true}));



mongoose.connect("mongodb://localhost:27017/secrets");
const trySchema = new mongoose.Schema({
    email: String,
    password:String
});
/*while working with encryption we need to create a key with 
that key both encryption and decryption will happen at the same time*/
const secret = "thisisdileepsecretkey";
/*Using the Schema we need to encrypt our password */
trySchema.plugin(encrypt,{secret:secret,encryptedFields:["password"]});

const item = mongoose.model("second",trySchema);

//To open home page use the router as "/"
app.get("/",function(req,res){
    res.render('home');
});
//Creatinng a Post Request That mean take the username and password from user and store them.
app.post("/register",function(req,res){
    const newUser = new item({
        email:req.body.username,
        password:req.body.password
    });
    newUser.save().then(function(result){
        res.render("successfull");
    })
    .catch(function(err){
        console.log(err)
    })
    
});
//creating a authorized login page if password matches it give the login page
app.post("/login",function(req,res){
    const username = req.body.username;
    const password = req.body.password;
    item.findOne({email:username})
    .then(function(foundUser){
        if(foundUser.password===password){
            res.render("secrets");
        }
        else{
            res.send("Password entered was wrong Try again");
        }
    })
    .catch(function(err){
        console.log(err);
    });
        
    });



app.get('/login',function(req,res){
    res.render('login');
});
app.get('/register',function(req,res){
    res.render('register');
});
app.get("/home",function(req,res){
    res.render('home');
});



/*creating the Uploading the images and viewing the images part*/

//choose the destination folder to store the images
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'public/uploads/')
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)) //Appending extensions
    }
  })
const upload = multer({ storage: storage });

app.get('/upload', (req, res) => {
    res.render('upload');
  });

app.get('/images', (req, res) => {
  fs.readdir('public/uploads', (err, files) => {
    res.render('images', { files });
  });
});

app.post('/upload', upload.single('image'), (req, res) => {
  res.redirect('/images');
});

app.listen(55555,function(){
    console.log("Server Started on 55555 port");
});