require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { s3Upload } = require('../s3Service');
const uuid = require('uuid').v4;
const User = require('../model/user_model');
const Product = require('../model/product_model');

const Trial = require('../model/trial_model'); // Import the Trial model
const session = require('express-session');
const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

router.get('/addp', function (req, res, next) {
  res.render('product.hbs', { title: 'Example' });
});

router.post('/upload', upload.any(), async (req, res) => {
  try {
    let user = req.session.user;
    let userId = req.session.user;
    const ObjectId = require('mongoose').Types.ObjectId;
    const userObjectId = new ObjectId(user);
    var keys = await s3Upload(req.files);
    const user_data = await User.findById(userId);
    console.log(keys);
    const newProduct = new Product({
      user: user,
      brand: req.body.brand,
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      location: req.body.location,
      photoUrl: keys,
    });

    await newProduct.save();

    res.redirect(`/users/dashboard`);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/searchp', async function (req, res, next) {
  try {
    let userId = req.session.user; // Get the user ID to exclude from the query
    const { brand, price, location, user } = req.query;
    const user_data = await User.findById(userId);
    // Construct the MongoDB query based on the provided search criteria
    const query = {};
    if (brand) {
      query.title = { $regex: brand, $options: 'i' }; // 'i' for case-insensitive
    }
    if (price) {
      query.price = price;
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (userId) {
      query.user = { $ne: userId }; // Add condition to exclude specific user ID
    }

    // Construct the MongoDB query to find all products excluding the specified user ID

    // Fetch all products from the database excluding the specified user ID
    const products = await Product.find(query).populate(
      'user',
      'username photoUrl'
    ); // Populate the 'user' field with 'username' only
    console.log(products);
    res.render('searchp.hbs', {
      session:req.session,
      products,
      user_data,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/editp/:id', async function (req, res, next) {
  try {
    // Retrieve the product ID from the request parameters
    const productId = req.params.id;

    // Fetch the product details from the database based on the product ID
    const product = await Product.findById(productId);

    // Render the editp.hbs template and pass the product details to it
    res.render('editp.hbs', { product: product });
  } catch (err) {
    // Handle errors
    next(err);
  }
});
router.post('/updatep/:id', upload.any(), async function (req, res, next) {
  try {
    let userId = req.session.user;

    const ObjectId = require('mongoose').Types.ObjectId;
    const userObjectId = new ObjectId(userId);

    const productId = req.params.id;
    var keys;

    // Check if there are any uploaded files
    if (req.files.length > 0) {
      // Upload new files to S3 and get the keys
      keys = await s3Upload(req.files);
    } else {
      // No new files uploaded, so use the existing keys
      // Retrieve the product to get the existing keys
      const product = await Product.findById(productId);
      keys = product.photoUrl;
    }
    // Fetch the product details from the request body
    const { brand, title, description, price, location } = req.body;

    // Update the product in the database
    await Product.findByIdAndUpdate(productId, {
      brand: brand,
      title: title,
      description: description,
      price: price,
      location: location,
      photoUrl: keys,
    });
    console.log(userId);
    // Redirect the user to the profile page or any other appropriate page
    res.redirect(`/users/${userObjectId}`);
  } catch (err) {
    // Handle errors
    next(err);
  }
});

router.post('/trial', async function (req, res, next) {
  console.log(req.session.loggedIn);
  let userId = req.session.user;
  // console.log(userId);
  const user_data = await User.findById(userId);
  res.render('trial.hbs', {
    session:req.session,
    puserId: req.body.UserId,
    pId: req.body.Id,
    brand: req.body.Brand,
    title: req.body.Title,
    description: req.body.Description,
    price: req.body.Price,
    location: req.body.Location,
    photoUrl: req.body.photoUrl,
    loggedIn: req.session.loggedIn ,
    user_data,
  });
  console.log(req.body);
});


router.post('/trials/:id/accept', async function(req, res, next){
  try {
    const trialId = req.params.id;
    await Trial.findByIdAndUpdate(trialId, { status: 'Accepted' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
// Route to reject a trial
router.post('/trials/:id/reject', async function(req, res, next){
  try {
    const trialId = req.params.id;
    await Trial.findByIdAndUpdate(trialId, { status: 'Rejected' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
router.post('/trials/:id/paid', async function(req, res, next){
  try {
    const trialId = req.params.id;
    await Trial.findByIdAndUpdate(trialId, { status: 'Payment Done' });
    await new Promise((resolve) => setTimeout(resolve, 10000));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post('/trials/:id/cancel', async function(req, res, next){
  try {
    const trialId = req.params.id;
    await Trial.findByIdAndUpdate(trialId, { status: 'Cancelled' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});



router.post('/book', async function (req, res, next) {
  try {
    let userId = req.session.user;

    const ObjectId = require('mongoose').Types.ObjectId;
    const userObjectId = new ObjectId(userId);
    console.log(req.body);
    const {
      productId,
      date,
      time,
      productUserId,
      brand,
      title,
      description,
      price,
      location,
      photoUrl,
    } = req.body; // Extract productId, date, time, and productUserId from the request body
    // Create a new trial document
    const trial = new Trial({
      productId: productId,
      date: date,
      timeSlot: time,
      userId: req.session.user, // Use the user's ID stored in the session
      productUserId: productUserId, // Include the product user's ID
      brand: brand, // Assuming product contains brand information
      title: title, // Assuming product contains title information
      description: description, // Assuming product contains description information
      price: price, // Assuming product contains price information
      location: location,
      photoUrl: photoUrl, // Assuming product contains location information
    });

    // Save the trial document to the database
    await trial.save();

    // Redirect the user to a success page or any other appropriate page
    res.redirect(`/users/dashboard/`);
  } catch (err) {
    // Handle errors
    next(err);
  }
});

// router.post('/delete/:id', async function (req, res, next) {
//   try {
//     // Retrieve the product ID from the request parameters
//     let userId = req.session.user;

//     const ObjectId = require('mongoose').Types.ObjectId;
//     const userObjectId = new ObjectId(userId);
//     const productId = req.params.id;

//     // Delete the product from the database
//     await Product.findByIdAndDelete(productId);

//     // Redirect the user to a relevant page after successful deletion
//     res.redirect(`/users/dashboard/`); // Redirect to the products page or any other appropriate page
//   } catch (err) {
//     // Handle errors
//     next(err);
//   }
// });
router.post('/delete/:id', async function (req, res, next) {
  try {
    const productId = req.params.id;

    // Delete the product from the database
    await Product.findByIdAndDelete(productId);

    // Redirect the user to a relevant page after successful deletion
    res.redirect('/users/dashboard'); // Redirect to the user's dashboard or any other appropriate page
  } catch (err) {
    // Handle errors
    next(err);
  }
});

router.get('/editt/:id', async function (req, res, next) {
  try {
    // Retrieve the product ID from the request parameters
    const trialId = req.params.id;

    // Fetch the product details from the database based on the product ID
    const trial = await Trial.findById(trialId);

    // Render the editp.hbs template and pass the product details to it
    res.render('editt.hbs', { trial });
  } catch (err) {
    // Handle errors
    next(err);
  }
});

router.post('/tdelete/:id', async function (req, res, next) {
  try {
    // Retrieve the product ID from the request parameters
    let userId = req.session.user;

    const ObjectId = require('mongoose').Types.ObjectId;
    const userObjectId = new ObjectId(userId);
    const trialId = req.params.id;

    // Delete the product from the database
    await Trial.findByIdAndDelete(trialId);

    // Redirect the user to a relevant page after successful deletion
    res.redirect(`/users/${userObjectId}`); // Redirect to the products page or any other appropriate page
  } catch (err) {
    // Handle errors
    next(err);
  }
});

router.post('/updatet/:id', async function (req, res, next) {
  try {
    let userId = req.session.user;

    const ObjectId = require('mongoose').Types.ObjectId;
    const userObjectId = new ObjectId(userId);
    const trialId = req.params.id;

    // Extract form data from the request body
    const { date, timeSlot } = req.body;
    console.log(req.body);
    // Update the trial in the database
    await Trial.findByIdAndUpdate(trialId, { date, timeSlot });
    // Redirect the user to the profile page or any other appropriate page
    res.redirect(`/users/${userObjectId}`);
  } catch (err) {
    // Handle errors
    next(err);
  }
});

// router.get('/searchr', async function(req, res, next) {
//     try {
//         let userId= req.session.user;

//         // Execute the MongoDB query to find matching products
//         const products = await Product.find(query);
//         return res.json({ status: "success" , products});
//         //res.render('search_results.hbs', { products, brand, price, location });
//     } catch (err) {
//         next(err);
//     }
//   });

module.exports = router;
