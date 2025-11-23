var express = require('express');
var router = express.Router();
var bcrypt =  require('bcrypt');
const User = require('../model/user_model');
const Product = require("../model/product_model");
const Trial = require('../model/trial_model');
const multer = require("multer");
const { uploadUserImage } = require("../uploadService");
const uuid = require("uuid").v4;
const path = require('path');

const storage = multer.memoryStorage(); 
const upload = multer({
  storage
});


router.get('/signup', function(req, res, next) {
  res.render('users.hbs', { title: 'Sign Up - Trial Mate', error: null });
});

router.get('/signin', function(req, res, next) {
  const error = req.query.error || null;
  const login = req.query.login || null;
  const redirect = req.query.redirect || '';
  res.render('login.hbs', { 
    title: 'Login - Trial Mate', 
    error: error ? decodeURIComponent(error) : null,
    login: login ? decodeURIComponent(login) : null,
    redirect: redirect
  });
});

/* GET users listing. */
router.post('/profile', upload.any(), async function(req, res, next) {
  try {
      // Validate all required fields
      const { username, name, email, password, address, pincode, phoneNumber } = req.body;
      
      if (!username || !name || !email || !password || !address || !pincode || !phoneNumber) {
          return res.status(400).json({ 
              error: 'All fields are required. Please fill in all information.'
          });
      }

      // Validate password criteria
      if (!checkPasswordCriteria(password)) {
          return res.status(400).json({ 
              error: 'Password does not meet the criteria. It must contain at least one capital letter, one special character, and one number.'
          });
      }

      // Check if username is already taken
      const existingUser = await User.findOne({ username: username.trim() });
      if (existingUser) {
          return res.status(400).json({ 
              error: 'Username is already taken. Please choose a different username.'
          });
      }

      // Check if email is already taken
      const existingEmail = await User.findOne({ email: email.trim() });
      if (existingEmail) {
          return res.status(400).json({ 
              error: 'Email is already registered. Please use a different email or sign in.'
          });
      }

      // Hash password
      const salt = await bcrypt.genSaltSync(10);
      const hashpassword = await bcrypt.hashSync(password, salt);
      
      // Handle file upload (optional)
      var keys = "user/images.png"; // Default image
      if (req.files && req.files.length > 0) {
          try {
              keys = await uploadUserImage(req.files);
          } catch (uploadError) {
              console.error("Upload error:", uploadError);
              // Continue with default image if upload fails
              keys = "user/images.png";
          }
      }
      
      // Create new user
      const newUser = new User({
          username: username.trim(),
          name: name.trim(),
          email: email.trim(),
          password: hashpassword,
          address: address.trim(),
          pincode: pincode.trim(),
          phoneNumber: phoneNumber.trim(),
          photoUrl: keys
      });

      await newUser.save();
      console.log('New user created:', username);
      
      res.json({ 
          success: true, 
          message: 'Account created successfully! Redirecting to login...' 
      });
  } catch (err) {
      console.error("Signup error:", err);
      
      // Handle specific MongoDB errors
      if (err.code === 11000) {
          const field = Object.keys(err.keyPattern)[0];
          return res.status(400).json({ 
              error: `${field} is already taken. Please choose a different ${field}.`
          });
      }
      
      return res.status(500).json({ 
          error: 'An error occurred during registration. Please try again.'
      });
  }
});



function checkPasswordCriteria(password) {
    // Regular expressions to match criteria
    const hasCapitalLetter = /[A-Z]/.test(password);
    const hasSpecialCharacter = /[!@#$%^&*()-_=+{};:,<.>?`~]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    // Check if all criteria are met
    return hasCapitalLetter && hasSpecialCharacter && hasNumber;
}





router.post('/login', async function(req,res,next){
  try{
    const { email, password, redirect } = req.body;
    const redirectUrl = redirect || '/users/dashboard';
    
    // Validate input
    if (!email || !password) {
      return res.redirect('/users/signin?error=' + encodeURIComponent('Please provide both email and password.') + (redirect ? '&redirect=' + encodeURIComponent(redirect) : ''));
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.trim() });
    
    if (!user) {
      return res.redirect('/users/signin?error=' + encodeURIComponent('Email not found. Please check your email or sign up.') + (redirect ? '&redirect=' + encodeURIComponent(redirect) : ''));
    }
    
    // Compare password
    const valid = await bcrypt.compareSync(password, user.password);
    
    if (valid) {
      req.session.loggedIn = true;
      req.session.user = user._id;
      req.session.username = user.username;
      console.log('User logged in:', user.username);
      return res.redirect(redirectUrl + (redirectUrl.includes('?') ? '&' : '?') + 'login=success');
    } else {
      return res.redirect('/users/signin?error=' + encodeURIComponent('Incorrect password. Please try again.') + (redirect ? '&redirect=' + encodeURIComponent(redirect) : ''));
    }
  } catch(err) {
    console.error('Login error:', err);
    const redirect = req.body.redirect || '';
    return res.redirect('/users/signin?error=' + encodeURIComponent('An error occurred during login. Please try again.') + (redirect ? '&redirect=' + encodeURIComponent(redirect) : ''));
  }
})
router.get('/logout', async function (req,res,next){
  req.session.destroy();
  res.redirect('/users');
})

function zipArrays(arr1, arr2) {
  return arr1.map((elem, index) => ({ elem1: elem, elem2: arr2[index] }));
}

router.get('/dashboard', async function (req,res,next){
  try{
    // Check if user is logged in
    if (!req.session.loggedIn || !req.session.user) {
      return res.redirect('/users/signin?error=' + encodeURIComponent('Please login to access your dashboard.'));
    }
    
    let userId = req.session.user;
    const user = await User.findById(userId);
    
    if (!user) {
      req.session.destroy();
      return res.redirect('/users/signin?error=' + encodeURIComponent('User not found. Please login again.'));
    }
    
    const query = {};
    if (userId) {
        query.user = userId;
    }
    const query2 = {};
    if (userId) {
      query2.userId = userId;
    }
    const query3 = {};
    if (userId) {
      query3.productUserId = userId;
    }
  
    const products = await Product.find(query);
    const trials = await Trial.find(query2).populate('productUserId', 'username photoUrl');
    const trialRequests = await Trial.find(query3).populate('userId', 'username photoUrl');
    
    // Get all trials where user is involved (for chat)
    const allUserTrials = await Trial.find({
      $or: [
        { userId: userId },
        { productUserId: userId }
      ]
    }).populate('userId', 'username photoUrl').populate('productUserId', 'username photoUrl');
    
    // Get unread message counts for each trial
    const Message = require('../model/message_model');
    const unreadCounts = {};
    for (const trial of allUserTrials) {
      const unreadCount = await Message.countDocuments({
        trialId: trial._id,
        receiverId: userId,
        read: false
      });
      unreadCounts[trial._id.toString()] = unreadCount;
    }
    
    trials.forEach(trial => {
      trial.dateString = trial.date.toDateString();
    });
    
    trialRequests.forEach(trial => {
      trial.dateString = trial.date.toDateString();
    });
    
    const error = req.query.error ? decodeURIComponent(req.query.error) : null;
    const success = req.query.success ? decodeURIComponent(req.query.success) : null;
    
    res.render('profile.hbs', { 
      user, 
      products, 
      trials, 
      trialRequests, 
      allUserTrials,
      unreadCounts: JSON.stringify(unreadCounts),
      error, 
      success 
    });
  }
  catch(err){
    console.error('Dashboard error:', err);
    next(err);
  }
})

// Route handler for /users/:id (used by product routes for redirects)
router.get('/:id', async function (req, res, next) {
  try {
    let userId = req.session.user;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).send('User not found');
    }

    const query = {};
    if (userId) {
      query.user = userId;
    }
    
    const query2 = {};
    if (userId) {
      query2.userId = userId;
    }
    const query3 = {};
    if (userId) {
      query3.productUserId = userId;
    }

    const products = await Product.find(query);
    const trials = await Trial.find(query2).populate('productUserId', 'username photoUrl');
    const trialRequests = await Trial.find(query3);
    
    trials.forEach(trial => {
      trial.dateString = trial.date.toDateString();
    });
    
    res.render('profile.hbs', { user, products, trials, trialRequests });
  } catch (err) {
    next(err);
  }
});




module.exports = router;


