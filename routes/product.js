require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { uploadProductImage } = require("../uploadService");
const uuid = require("uuid").v4;
const Product = require("../model/product_model");
const Trial = require("../model/trial_model"); // Import the Trial model
const Message = require("../model/message_model"); // Import the Message model
const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

router.get("/addp", function (req, res, next) {
  res.render("product.hbs", { title: "Example" });
});

router.post("/upload", upload.any(), async (req, res) => {
  try {
    let user = req.session.user;
    const ObjectId = require("mongoose").Types.ObjectId;
    const userObjectId = new ObjectId(user);
    var keys = await uploadProductImage(req.files);
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

    res.redirect(`/users/${userObjectId}?success=` + encodeURIComponent('Product added successfully!'));
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/searchp", async function (req, res, next) {
  try {
    // Allow viewing products without login - anyone can browse
    let userId = req.session.user || null; // Get the user ID if logged in
    const { brand, price, location, user } = req.query;

    // Construct the MongoDB query based on the provided search criteria
    const query = {};
    if (brand) {
      query.brand = new RegExp(brand, 'i'); // Case-insensitive search
    }
    if (price) {
      query.price = { $lte: parseFloat(price) }; // Less than or equal to price
    }
    if (location) {
      query.location = new RegExp(location, 'i'); // Case-insensitive search
    }
    // Only exclude user's own products if they are logged in
    if (userId) {
      query.user = { $ne: userId }; // Add condition to exclude specific user ID
    }

    // Fetch all products from the database
    const products = await Product.find(query).populate(
      "user",
      "username photoUrl",
    ); // Populate the 'user' field with 'username' only
    
    const error = req.query.error ? decodeURIComponent(req.query.error) : null;
    const success = req.query.success ? decodeURIComponent(req.query.success) : null;
    
    res.render("searchp.hbs", { 
      products, 
      loggedIn: req.session.loggedIn || false, 
      userId: userId,
      error, 
      success 
    });
  } catch (err) {
    next(err);
  }
});
router.get("/editp/:id", async function (req, res, next) {
  try {
    // Retrieve the product ID from the request parameters
    const productId = req.params.id;

    // Fetch the product details from the database based on the product ID
    const product = await Product.findById(productId);

    // Render the editp.hbs template and pass the product details to it
    res.render("editp.hbs", { product: product });
  } catch (err) {
    // Handle errors
    next(err);
  }
});
router.post("/updatep/:id", upload.any(), async function (req, res, next) {
  try {
    let userId = req.session.user;

    const ObjectId = require("mongoose").Types.ObjectId;
    const userObjectId = new ObjectId(userId);

    const productId = req.params.id;
    var keys;

    // Check if there are any uploaded files
    if (req.files.length > 0) {
      // Upload new files and get the keys
      keys = await uploadProductImage(req.files);
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

router.post("/trial", async function (req, res, next) {
  try {
    // Check if user is logged in
    if (!req.session.loggedIn || !req.session.user) {
      return res.redirect('/users/signin?error=' + encodeURIComponent('Please login to request a trial.'));
    }

    const userId = req.session.user;
    const productUserId = req.body.UserId;
    const productId = req.body.Id;

    // Prevent users from requesting trials for their own products
    if (userId === productUserId) {
      return res.redirect('/product/searchp?error=' + encodeURIComponent('You cannot request a trial for your own product.'));
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.redirect('/product/searchp?error=' + encodeURIComponent('Product not found.'));
    }

    // Check if user already has a pending/accepted trial for this product
    const existingTrial = await Trial.findOne({
      userId: userId,
      productId: productId,
      status: { $in: ['Pending', 'Accepted'] }
    });

    if (existingTrial) {
      return res.redirect('/product/searchp?error=' + encodeURIComponent('You already have a trial request for this product.'));
    }

    // Get existing trials for this user to check for overlaps
    const existingTrials = await Trial.find({ 
      userId: userId,
      status: { $in: ['Pending', 'Accepted'] }
    });

    const error = req.query.error ? decodeURIComponent(req.query.error) : null;

    res.render("trial.hbs", {
      puserId: productUserId,
      pId: productId,
      brand: req.body.Brand,
      title: req.body.Title,
      description: req.body.Description,
      price: req.body.Price,
      location: req.body.Location,
      photoUrl: req.body.photoUrl,
      existingTrials: JSON.stringify(existingTrials.map(t => ({
        date: t.date.toISOString().split('T')[0],
        timeSlot: t.timeSlot
      }))),
      error: error
    });
  } catch (err) {
    console.error('Trial request error:', err);
    next(err);
  }
});

router.post("/book", async function (req, res, next) {
  try {
    // Check if user is logged in
    if (!req.session.loggedIn || !req.session.user) {
      return res.redirect('/users/signin?error=' + encodeURIComponent('Please login to book a trial.'));
    }

    let userId = req.session.user;
    const ObjectId = require("mongoose").Types.ObjectId;
    const userObjectId = new ObjectId(userId);
    
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
    } = req.body;

    // Validate required fields
    if (!productId || !date || !time || !productUserId) {
      return res.redirect('/product/searchp?error=' + encodeURIComponent('All fields are required.'));
    }

    // Prevent users from requesting trials for their own products
    if (userId === productUserId) {
      return res.redirect('/product/searchp?error=' + encodeURIComponent('You cannot request a trial for your own product.'));
    }

    // Validate date is in the future
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.redirect('/product/trial?error=' + encodeURIComponent('Please select a future date.'));
    }

    // Check for time slot overlap - user cannot have multiple trials at the same date/time
    const overlappingTrial = await Trial.findOne({
      userId: userId,
      date: selectedDate,
      timeSlot: time,
      status: { $in: ['Pending', 'Accepted'] }
    });

    if (overlappingTrial) {
      return res.redirect('/product/trial?error=' + encodeURIComponent('You already have a trial scheduled at this date and time. Please choose a different slot.'));
    }

    // Check if product still exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.redirect('/product/searchp?error=' + encodeURIComponent('Product no longer available.'));
    }

    // Check if user already has a pending/accepted trial for this product
    const existingTrial = await Trial.findOne({
      userId: userId,
      productId: productId,
      status: { $in: ['Pending', 'Accepted'] }
    });

    if (existingTrial) {
      return res.redirect('/product/searchp?error=' + encodeURIComponent('You already have a trial request for this product.'));
    }

    // Create a new trial document
    const trial = new Trial({
      productId: productId,
      date: selectedDate,
      timeSlot: time,
      userId: userId,
      productUserId: productUserId,
      brand: brand,
      title: title,
      description: description,
      price: price,
      location: location,
      photoUrl: photoUrl,
      status: 'Pending'
    });

    // Save the trial document to the database
    await trial.save();

    // Redirect the user to dashboard with success message
    res.redirect(`/users/dashboard?success=` + encodeURIComponent('Trial requested successfully!'));
  } catch (err) {
    console.error('Book trial error:', err);
    return res.redirect('/product/searchp?error=' + encodeURIComponent('An error occurred. Please try again.'));
  }
});

router.post("/delete/:id", async function (req, res, next) {
  try {
    // Check if user is logged in
    if (!req.session.loggedIn || !req.session.user) {
      return res.redirect('/users/signin?error=' + encodeURIComponent('Please login to delete products.'));
    }

    let userId = req.session.user;
    const productId = req.params.id;

    // Find the product
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.redirect('/users/dashboard?error=' + encodeURIComponent('Product not found.'));
    }

    // Verify the user owns the product
    if (product.user.toString() !== userId.toString()) {
      return res.redirect('/users/dashboard?error=' + encodeURIComponent('You are not authorized to delete this product.'));
    }

    // Delete the product from the database
    await Product.findByIdAndDelete(productId);

    // Also delete any trials associated with this product
    await Trial.deleteMany({ productId: productId });

    // Redirect to dashboard with success message
    res.redirect('/users/dashboard?success=' + encodeURIComponent('Product deleted successfully!'));
  } catch (err) {
    console.error('Delete product error:', err);
    return res.redirect('/users/dashboard?error=' + encodeURIComponent('An error occurred while deleting the product.'));
  }
});

router.get("/editt/:id", async function (req, res, next) {
  try {
    // Retrieve the product ID from the request parameters
    const trialId = req.params.id;

    // Fetch the product details from the database based on the product ID
    const trial = await Trial.findById(trialId);

    // Render the editp.hbs template and pass the product details to it
    res.render("editt.hbs", { trial });
  } catch (err) {
    // Handle errors
    next(err);
  }
});

router.post("/tdelete/:id", async function (req, res, next) {
  try {
    if (!req.session.loggedIn || !req.session.user) {
      return res.redirect('/users/signin?error=' + encodeURIComponent('Please login to cancel trials.'));
    }

    let userId = req.session.user;
    const ObjectId = require("mongoose").Types.ObjectId;
    const userObjectId = new ObjectId(userId);
    const trialId = req.params.id;

    // Find the trial
    const trial = await Trial.findById(trialId);
    if (!trial) {
      return res.redirect('/users/dashboard?error=' + encodeURIComponent('Trial not found.'));
    }

    // Verify user owns the trial
    if (trial.userId.toString() !== userId.toString()) {
      return res.redirect('/users/dashboard?error=' + encodeURIComponent('You are not authorized to cancel this trial.'));
    }

    const { cancellationReason } = req.body;

    if (!cancellationReason) {
      return res.redirect('/users/dashboard?error=' + encodeURIComponent('Please provide a reason for cancellation.'));
    }

    // Update trial status to Cancelled instead of deleting
    await Trial.findByIdAndUpdate(trialId, {
      status: 'Cancelled',
      cancellationReason: cancellationReason
    });

    res.redirect(`/users/dashboard?success=` + encodeURIComponent('Trial cancelled successfully.'));
  } catch (err) {
    console.error('Cancel trial error:', err);
    next(err);
  }
});

router.post("/updatet/:id", async function (req, res, next) {
  try {
    if (!req.session.loggedIn || !req.session.user) {
      return res.redirect('/users/signin?error=' + encodeURIComponent('Please login to reschedule trials.'));
    }

    let userId = req.session.user;
    const ObjectId = require("mongoose").Types.ObjectId;
    const userObjectId = new ObjectId(userId);
    const trialId = req.params.id;

    // Find the trial
    const trial = await Trial.findById(trialId);
    if (!trial) {
      return res.redirect('/users/dashboard?error=' + encodeURIComponent('Trial not found.'));
    }

    // Verify user owns the trial
    if (trial.userId.toString() !== userId.toString()) {
      return res.redirect('/users/dashboard?error=' + encodeURIComponent('You are not authorized to reschedule this trial.'));
    }

    // Extract form data from the request body
    const { date, timeSlot } = req.body;
    
    if (!date || !timeSlot) {
      return res.redirect('/product/editt/' + trialId + '?error=' + encodeURIComponent('Date and time slot are required.'));
    }

    // Validate date is in the future
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.redirect('/product/editt/' + trialId + '?error=' + encodeURIComponent('Please select a future date.'));
    }

    // If trial was rejected, require different date
    if (trial.status === 'Rejected') {
      const oldDate = new Date(trial.date);
      oldDate.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (oldDate.getTime() === selectedDate.getTime() && trial.timeSlot === timeSlot) {
        return res.redirect('/product/editt/' + trialId + '?error=' + encodeURIComponent('Please select a different date and time slot for rescheduling.'));
      }
    }

    // Check for time slot overlap
    const overlappingTrial = await Trial.findOne({
      userId: userId,
      date: selectedDate,
      timeSlot: timeSlot,
      status: { $in: ['Pending', 'Accepted'] },
      _id: { $ne: trialId }
    });

    if (overlappingTrial) {
      return res.redirect('/product/editt/' + trialId + '?error=' + encodeURIComponent('You already have a trial scheduled at this date and time.'));
    }

    // Update the trial in the database
    await Trial.findByIdAndUpdate(trialId, { 
      date: selectedDate, 
      timeSlot: timeSlot,
      status: 'Pending', // Reset to pending if it was rejected/cancelled
      rescheduleRequested: true
    });
    
    res.redirect(`/users/dashboard?success=` + encodeURIComponent('Trial rescheduled successfully!'));
  } catch (err) {
    console.error('Reschedule error:', err);
    next(err);
  }
});

// Accept trial request
router.post("/accept-trial/:id", async function (req, res, next) {
  try {
    // Check if user is logged in
    if (!req.session.loggedIn || !req.session.user) {
      return res.redirect('/users/signin?error=' + encodeURIComponent('Please login to accept trial requests.'));
    }

    const userId = req.session.user;
    const trialId = req.params.id;

    // Find the trial
    const trial = await Trial.findById(trialId);

    if (!trial) {
      return res.redirect('/users/dashboard?error=' + encodeURIComponent('Trial request not found.'));
    }

    // Verify the user owns the product
    if (trial.productUserId.toString() !== userId.toString()) {
      return res.redirect('/users/dashboard?error=' + encodeURIComponent('You are not authorized to accept this trial request.'));
    }

    // Check if trial is already accepted or rejected
    if (trial.status !== 'Pending') {
      return res.redirect('/users/dashboard?error=' + encodeURIComponent('This trial request has already been processed.'));
    }

    // Check for time slot conflicts with other accepted trials for the same product
    const conflictingTrial = await Trial.findOne({
      productId: trial.productId,
      date: trial.date,
      timeSlot: trial.timeSlot,
      status: 'Accepted',
      _id: { $ne: trialId }
    });

    if (conflictingTrial) {
      return res.redirect('/users/dashboard?error=' + encodeURIComponent('Another trial is already accepted for this product at the same date and time.'));
    }

    // Update trial status to Accepted
    await Trial.findByIdAndUpdate(trialId, { status: 'Accepted' });

    // Reject other pending trials for the same product at the same date/time
    await Trial.updateMany(
      {
        productId: trial.productId,
        date: trial.date,
        timeSlot: trial.timeSlot,
        status: 'Pending',
        _id: { $ne: trialId }
      },
      { status: 'Rejected' }
    );

    res.redirect('/users/dashboard?success=' + encodeURIComponent('Trial request accepted successfully!'));
  } catch (err) {
    console.error('Accept trial error:', err);
    return res.redirect('/users/dashboard?error=' + encodeURIComponent('An error occurred. Please try again.'));
  }
});

// Reject trial request
router.post("/reject-trial/:id", async function (req, res, next) {
  try {
    // Check if user is logged in
    if (!req.session.loggedIn || !req.session.user) {
      return res.redirect('/users/signin?error=' + encodeURIComponent('Please login to reject trial requests.'));
    }

    const userId = req.session.user;
    const trialId = req.params.id;

    // Find the trial
    const trial = await Trial.findById(trialId);

    if (!trial) {
      return res.redirect('/users/dashboard?error=' + encodeURIComponent('Trial request not found.'));
    }

    // Verify the user owns the product
    if (trial.productUserId.toString() !== userId.toString()) {
      return res.redirect('/users/dashboard?error=' + encodeURIComponent('You are not authorized to reject this trial request.'));
    }

    // Check if trial is already processed
    if (trial.status !== 'Pending') {
      return res.redirect('/users/dashboard?error=' + encodeURIComponent('This trial request has already been processed.'));
    }

    const { rejectionReason } = req.body;
    const reason = rejectionReason || 'No reason provided';

    // Update trial status to Rejected with reason
    await Trial.findByIdAndUpdate(trialId, { 
      status: 'Rejected',
      rejectionReason: reason
    });

    res.redirect('/users/dashboard?success=' + encodeURIComponent('Trial request rejected.'));
  } catch (err) {
    console.error('Reject trial error:', err);
    return res.redirect('/users/dashboard?error=' + encodeURIComponent('An error occurred. Please try again.'));
  }
});

// Chat routes
router.get("/chat/:trialId", async function (req, res, next) {
  try {
    if (!req.session.loggedIn || !req.session.user) {
      return res.redirect('/users/signin?error=' + encodeURIComponent('Please login to access chat.'));
    }

    const trialId = req.params.trialId;
    const userId = req.session.user;

    // Find the trial
    const trial = await Trial.findById(trialId)
      .populate('userId', 'username photoUrl')
      .populate('productUserId', 'username photoUrl');

    if (!trial) {
      return res.redirect('/users/dashboard?error=' + encodeURIComponent('Trial not found.'));
    }

    // Verify user is part of this trial
    if (trial.userId._id.toString() !== userId.toString() && trial.productUserId._id.toString() !== userId.toString()) {
      return res.redirect('/users/dashboard?error=' + encodeURIComponent('You are not authorized to access this chat.'));
    }

    // Get all messages for this trial
    const messages = await Message.find({ trialId: trialId })
      .populate('senderId', 'username photoUrl')
      .sort({ createdAt: 1 });

    // Determine the other user
    const otherUser = trial.userId._id.toString() === userId.toString() 
      ? trial.productUserId 
      : trial.userId;

    res.render("chat.hbs", { 
      trial, 
      messages, 
      otherUser,
      currentUserId: userId 
    });
  } catch (err) {
    console.error('Chat error:', err);
    next(err);
  }
});

router.post("/chat/:trialId", async function (req, res, next) {
  try {
    if (!req.session.loggedIn || !req.session.user) {
      return res.status(401).json({ error: 'Please login to send messages.' });
    }

    const trialId = req.params.trialId;
    const userId = req.session.user;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    // Find the trial
    const trial = await Trial.findById(trialId);

    if (!trial) {
      return res.status(404).json({ error: 'Trial not found.' });
    }

    // Verify user is part of this trial
    if (trial.userId.toString() !== userId.toString() && trial.productUserId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You are not authorized to send messages in this chat.' });
    }

    // Determine receiver
    const receiverId = trial.userId.toString() === userId.toString() 
      ? trial.productUserId 
      : trial.userId;

    // Create message
    const newMessage = new Message({
      trialId: trialId,
      senderId: userId,
      receiverId: receiverId,
      message: message.trim()
    });

    await newMessage.save();

    // Populate sender for response
    await newMessage.populate('senderId', 'username photoUrl');

    res.json({ success: true, message: newMessage });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'An error occurred while sending the message.' });
  }
});

// Get messages for a trial (AJAX endpoint)
router.get("/messages/:trialId", async function (req, res, next) {
  try {
    if (!req.session.loggedIn || !req.session.user) {
      return res.status(401).json({ error: 'Please login.' });
    }

    const trialId = req.params.trialId;
    const userId = req.session.user;

    // Verify user is part of this trial
    const trial = await Trial.findById(trialId);
    if (!trial || (trial.userId.toString() !== userId.toString() && trial.productUserId.toString() !== userId.toString())) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    // Get all messages
    const messages = await Message.find({ trialId: trialId })
      .populate('senderId', 'username photoUrl')
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'An error occurred.' });
  }
});

module.exports = router;
