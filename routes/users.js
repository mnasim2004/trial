var express = require('express');
var router = express.Router();
var bcrypt =  require('bcrypt');
const User = require('../model/user_model');
const Product = require("../model/product_model");


router.get('/signup', function(req, res, next) {
  res.render('users.hbs', { title: 'Example' });
});

router.get('/signin', function(req, res, next) {
  res.render('login.hbs', { title: 'Example' });
});

/* GET users listing. */
router.post('/profile', async function(req, res, next) {
  // Check password criteria
  if (!checkPasswordCriteria(req.body.password)) {
      return res.status(400).json("Password does not meet the criteria.");
  }

  try {
      // Check if username is already taken
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
          return res.status(400).json("Username is already taken.");
      }

      const salt = await bcrypt.genSaltSync(10);
      const hashpassword = await bcrypt.hashSync(req.body.password, salt);

      const newUser = new User({
          username: req.body.username,
          name: req.body.name,
          email: req.body.email,
          password: hashpassword,
          address: req.body.address,
          pincode: req.body.pincode,
          phoneNumber: req.body.phoneNumber
      });

      await newUser.save();
      res.redirect('/users');
  } catch (err) {
      return next(err);
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
    console.log(req.body.password,req.body.email)
   const user= await User.findOne({email:req.body.email})
   if(user){
       const valid= await bcrypt.compareSync(req.body.password, user.password);
       if(valid){
          req.session.loggedIn= true;
          req.session.user= user._id;
          res.redirect(`/users/${user._id}`);
       }
       else{
           res.status(200).json("wrong password");
       }
   }
   else{
       res.status(200).json("wrong email");
   }
  }catch(err){
    
   next(err)}
})
router.get('/logout', async function (req,res,next){
  req.session.destroy();
  res.redirect('/users');
})


router.get('/:id', async function (req,res,next){
  try{
    let userId= req.session.user;
    const user= await User.findById(req.params.id);
    const query = {};
    if (userId) {
        query.user =  userId ; // Add condition to exclude specific user ID
    }

    const products = await Product.find(query);
    res.render('profile.hbs', { user ,products});
  }
  catch(err){
    next(err)
  }
})
// const ObjectId = mongoose.Types.ObjectId;

// router.get('/:id', async function (req, res, next) {
//   try {
//     let userId = req.session.user;
//     const user = await User.findById(req.params.id);

//     const query = {};
//     if (userId) {
//       if (mongoose.Types.ObjectId.isValid(userId)) {
//         query.user = ObjectId(userId); // Convert userId to ObjectId
//       } else {
//         // Handle invalid userId
//       }
//     }

//     const products = await Product.find(query);
//     res.render('profile.hbs', { user, products });
//   } catch (err) {
//     next(err);
//   }
// });




module.exports = router;


