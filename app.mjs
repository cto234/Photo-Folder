import './db.mjs';
import mongoose from 'mongoose';
import session from 'express-session';
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import * as auth from './auth.mjs';
import * as dotenv from 'dotenv';
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'hullo',
    resave: false,
    saveUninitialized: true,
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

const User = mongoose.model('User')
const Image = mongoose.model('Image');
const Folder = mongoose.model('Folder');

const loginMessages = {"PASSWORDS DO NOT MATCH": 'Incorrect password', "USER NOT FOUND": 'User doesn\'t exist'};
const registrationMessages = {"USERNAME ALREADY EXISTS": "Username already exists", "USERNAME PASSWORD TOO SHORT": "Username or password is too short"};

//=======       ^ APP  SETUP ^     ==============================================//
//-------------------------------------------------------------------------------//
//=======  v MIDDLEWARE/Classes v  ==============================================//

class FolderObj{
    constructor(title, slug, description, images){
        this.title = title,
        this.slug = slug,
        this.description = description,
        this.images = images
    }
}

const paths = [
'/add-image', 
'/add', 
'/edit-title', 
'/error', 
'/folder-contents',
'/index',
'/layout', 
'/login',
'/register',
'/sign']

const allowedPaths = [process.env.SIGN_PATH, process.env.LOGIN_PATH, process.env.REG_PATH];

const filteredPaths = paths.filter(path => allowedPaths.includes(path)); //higher order function (filter)


//require authentication to access certain paths:       --param is array of paths

app.use(auth.authNotRequired(filteredPaths));

//From hw5
// make {{user}} variable available for all paths
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
  });


//=======       ^ MIDDLEWARE ^     ==============================================//
//-------------------------------------------------------------------------------//
//=======     v ROUTE HANDLERS v   ==============================================//

app.get('/', (req, res) => {                //home page

    Folder.find({user: req.session.user.username}).sort('-createdAt').exec((err, folders) => {
        res.render('index', {user: req.session.user, folders: folders});
      });
      
});    

app.get('/add', (req, res) => {             //add folder page
    res.render('add');
})

app.post('/add', (req, res) => {
    const newFolder = new Folder({ 
        user: req.session.user.username,
        title: req.body.title,
        description: req.body.description });   
    newFolder.save((err, result) => {
        if(err){
            console.log(err);
            res.render('error', {message: 'Error adding folder'}); 
        }else{
            console.log(result);
            console.log(result.title + " created successfully");
            res.redirect('/');
        }
    })
})

app.get('/folder/:slug', (req, res) => {
    Folder.findOne({slug: req.params.slug})
    .populate('images')                         //folder schema only references images. Need to populate
    .exec((err, folder) => {
        if(err){
            console.log(err);
        }
        else if(folder.user !== req.session.user.username){
            res.render('error', {message: 'Cannot open folder. That folder belongs to a different user'});
        }
        else{
            const folderObj = new FolderObj(folder.title, folder.slug, folder.description, folder.images);
            res.render('folder-contents', folderObj);
        }     
    });
});

app.post('/folder/:slug', (req, res) => {
    const newImage = new Image({
        url: req.body.url,
        caption: req.body.caption
    });
    newImage.save((err, result) => {
        if(err){
            console.log(err);
            res.render('error', {message: 'Error adding image'});
        }else{
            //now add to folder...
            Folder.findOne({slug: req.params.slug}, function(err, folder){
                if(err){
                    console.log(err);
                }
                else if(folder.user !== req.session.user.username){
                    res.render('error', {message: 'Cannot add to this folder. This folder belongs to a different user'});
                }
                else{
                    console.log("Adding image: ", result);
                    folder.images.push(result._id);//save image's id to the article whose page we're on
                    folder.save((err, result) => {
                        const route = '/folder/'+req.params.slug;    //res.redirect('/folder/:slug') wasn't working. This does.
                        res.redirect(route); 
                    });
                    
                }
            });
        }
    })
})

app.get('/folder/:slug/add-image', (req, res) => {
    res.render('add-image', {slug: req.params.slug});
})

app.get('/folder/:slug/edit-title', (req, res) => {
    Folder.findOne({slug: req.params.slug}) 
    .exec((err, folder) => {
        res.render('edit-title', {folder: folder});
    })
})

app.post('/folder/:slug/edit-title', (req, res) => {
    Folder.findOne({slug: req.params.slug}) 
    .exec((err, folder) => {
        console.log('Editing title. Original: ',folder);
        folder.title = req.body.newTitle||folder.title; //keeps old title if no input
        folder.description = req.body.newDescription;
        folder.save((err, result) => {
            if(err){
                console.log(err);
            }
            else{
                console.log('New title: ', result);
                const newRoute = '/folder/'+result.slug;
                res.redirect(newRoute);
            }
        })
    })
})

//---------------------login stuff--------------------//
app.get('/sign', (req, res) => {
    req.session.user = undefined;               //log out
    res.render('sign', {sign: true});
})

app.get('/login', (req, res) => {
    res.render('login', {sign: true});
});

app.post('/login', (req, res) => {
  // setup callbacks for login success and error
  function success(user) {
    auth.startAuthenticatedSession(req, user, (err) => {
      if(!err) {
        res.redirect('/'); 
      } else {
        res.render('error', {message: 'error starting auth sess: ' + err}); 
      }
    }); 
  }

  function error(err) {
    res.render('login', {sign: true, message: loginMessages[err.message] || 'Login unsuccessful'}); 
  }

  // attempt to login
  auth.login(req.body.username, req.body.password, error, success);
});

app.get('/register', (req, res) => {
    res.render('register', {sign: true});
  });
  
  app.post('/register', (req, res) => {
    // setup callbacks for register success and error
    function success(newUser) {
      auth.startAuthenticatedSession(req, newUser, (err) => {
          if (!err) {
            console.log("redirecting to home after registering...");
              res.redirect('/');
          } else {
              res.render('error', {message: 'err authing???'}); 
          }
      });
    }
  
    function error(err) {
      res.render('register', {sign: true, message: registrationMessages[err.message] ?? 'Registration error'}); 
    }
  
    // attempt to register new user
    auth.register(req.body.username, req.body.password, req.body.passwordConfirm, error, success);
  });
//---------------------login stuff--------------------//


//=======    ^ ROUTE HANDLERS ^    ==============================================//

app.listen(process.env.PORT || 3000);
