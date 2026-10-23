const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add customer name'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please add customer phone number'],
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  totalSpent: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
