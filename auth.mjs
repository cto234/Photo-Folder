import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';


const startAuthenticatedSession = (req, user, cb) => {
  req.session.regenerate((err) => {
    if (!err) {
      req.session.user = user; 
      cb();             
    } else {
      cb(err);
    }
  });
};

// assumes that User was registered in `./db.mjs`
const User = mongoose.model('User');

function hashPassword(password, cb) {
  bcrypt.genSalt(function(err, salt) {
    if (!err) {  
      // create hash with salt
      bcrypt.hash(password, salt, function(err, hash) {
        if (!err) {  
          cb(err, hash);
        } else {
          // hash error 
          cb(err);
        }
      });
    } else {
      // gen salt error 
      cb(err);
    }
  });
}

function register(username, password, passwordConfirm, errorCallback, successCallback) {
  if (username.length >= 4 && password.length >= 8) {
    if (password === passwordConfirm) { // Check if password and password confirmation match
      User.find({ username: username }, (err, users, count) => {
        if (!err && count === undefined && users.length === 0) {
          hashPassword(password, (err, hash) => {
            if (!err) {
              // TODO: create and save a user
              // call errorCallback or successCallback as necessary
              // make sure the error message match!
              const userObject = new User({
                username: username,
                password: hash
              });

              userObject.save((err, result) => {
                if (err) {
                  console.log('error saving document');
                  console.log(err);
                  errorCallback({ message: 'DOCUMENT SAVE ERROR' });
                } else {
                  console.log("Registration successful");
                  console.log("New user's info: ");
                  console.log(result);
                  successCallback(result);
                }
              });

            } else {
              errorCallback({ message: 'HASH ERROR ' + err });
            }
          });
        } else {
          console.log('username already exists in database');
          errorCallback({ message: 'USERNAME ALREADY EXISTS' });
        }
      });
    } else {
      errorCallback({ message: 'PASSWORDS DO NOT MATCH' });
    }
  } else {
    errorCallback({ message: 'USERNAME PASSWORD TOO SHORT' });
  }
}


const login = (username, password, errorCallback, successCallback) => {
  User.findOne({username: username}, (err, user) => {
    if ((!err) && user) {                         //user exists

      bcrypt.compare(password, user.password, (err, passwordMatch) => {    

        if(passwordMatch){
          successCallback(user);                //Login successful
        }else{
          errorCallback({message:'PASSWORDS DO NOT MATCH'});
        }

       });
      
    }else{                                      //error searching for username 
      console.log('error:', err);
      errorCallback({message:'USER NOT FOUND'});
    }
   });
};

// creates middleware that redirects to login if path is not included in authNotRequiredPaths
const authNotRequired = authNotRequiredPaths => {
  return (req, res, next) => {
    if(!authNotRequiredPaths.includes(req.path)) {
      if(!req.session.user) {
        res.redirect('/sign'); 
      }
      else {
        next(); 
      }
    } 
    
    else {
      next(); 
    }
  };
};

export {
  startAuthenticatedSession,
  register,
  login,
  authNotRequired
};