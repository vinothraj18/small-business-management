const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be non-negative']
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  minStockThreshold: {
    type: Number,
    default: 5
  },
  category: {
    type: String,
    default: 'General'
  },
  sku: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
