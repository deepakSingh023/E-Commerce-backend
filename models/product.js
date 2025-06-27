const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  features: {
    type:  [String],
    required: true
  },
  featuredAt: {
    type: Boolean,
    required: true
  },
  size: {
    type: [String],
    default: []
  },
  inStock: {
    type: Boolean,
    required: true
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: true
    }
  }],
  // Updated images field to store multiple images
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  }],
  // Keep this for backward compatibility if needed
  cloudinaryId: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);