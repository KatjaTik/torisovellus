const express = require('express')
const { v4: uuidv4 } = require('uuid')
const app = express()
const passport = require('passport')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const BasicStrategy = require('passport-http').BasicStrategy;
app.use(bodyParser.json());
var cloudinary = require('cloudinary');
var cloudinaryStorage = require('multer-storage-cloudinary');
var multer = require('multer');
const upload = multer({dest: '/uploads'})
let today = new Date().toISOString().slice(0, 10)
let userDb = [];
let postDb = [];

var storage =  cloudinaryStorage({
    cloudinary: cloudinary,
    folder: '',
    allowedFormats: ['jpg', 'png'],
});

var parser = multer({ storage: storage});

app.set('port', (process.env.PORT || 80));

app.post('/createpost', upload.fields([]), parser.single('image'), (req, res) => {
    postsDb.push({ title: req.body.title, 
                category: req.body.category,  
                location: req.body.location, 
                price: req.body.price,
                dateOfPost: today 
                })
    console.log(req.file)
    res.sendStatus(201);
    res.json(req.file);
  })

passport.use(new BasicStrategy(
    (username, password, done) => {
        console.log('Basic strategy params, username: ' + username + " , password: " + password)
        
        //credential check
       //search userDb for matching user and password
        
       const searchResult = userDb.find(user => {
           if(username === user.username) {
               if(bcrypt.compareSync(password, user.password)) {
                   return true;
               }
           }
        return false;
        })
        if(searchResult != undefined) {
            done(null, searchResult); //successfully authenticated
        } else {
            done(null, false);//no credential match
        }
        
    }
));
app.get('/', (req, res) => {
  res.send('Tervetuloa Tori.fi:n halpaan kopioon')
})

//app.get('/protectedResource', passport.authenticate('basic', {session: false}), (req, res) => {
    

    //this api resource is now protected with http basic
    
 //   res.send('Successfully accessed protected resource!');
//})

app.get('/deletepost', passport.authenticate('jwt', {session: false}), (req, res) => {
    const post = postDb.find(p => p.id === req.params.id);
    if(post === undefined) {
        res.sendStatus(404);
    }else{
        res.json(post);
    }
}) 


/*This route will recieve data structure:
    {
     "username": "foo",
     "password": "bar",
     "email": "foo@bar.com",
    
    }
*/
app.get('/posts', (req, res) => {
    console.log('Printing all posts..');
    res.send(postDb);
})

app.post('/signup', (req, res) => {
    
    console.log('original password ' + req.body.password);
    const salt = bcrypt.genSaltSync(6);
    console.log('salt' + salt);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    console.log('hashed password');
    console.log(hashedPassword);
    const newUser = {
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
    }

    userDb.push(newUser);
    res.sendStatus(201);
})

/**JWT implemention below */
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwtSecretKey = "mySecretKey";
const secrets = require('./secrets.json');
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secrets.jwtSignKey

};

passport.use(new JwtStrategy(options, (payload, done) => {
    //do something with the payload

    //pass the control to the handler methods
    done(null, {});

}));

app.post('/login', passport.authenticate('basic', {session: false}), (req, res) => {
//create a JWT for the client
const token = jwt.sign({foo: "bar"}, secrets.jwtSignKey);

//send the JWT to the client
res.json({ token: token })
})

//app.get('/jwtProtectedResource', passport.authenticate('jwt', {session: false}), (req, res) => {
//    res.send("You successfully accessed JWT protected API resource");
//})

app.listen(app.get('port'), () => {
  console.log(`Example app listening at`, app.get('port'));
})