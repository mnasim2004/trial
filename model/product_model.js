const mongoose = require('mongoose');

// Define schema
const productSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    photoUrl: {
        type: String,
        required: true
    }
});

// Create model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
