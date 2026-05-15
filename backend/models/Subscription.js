const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceName: {
    type: String,
    required: [true, 'Please add a service name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Entertainment',
      'Productivity',
      'Education',
      'Fitness',
      'Cloud',
      'Utilities',
      'Finance',
      'Other'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be a positive number']
  },
  billingCycle: {
    type: String,
    enum: ['Monthly', 'Yearly'],
    default: 'Monthly'
  },
  renewalDate: {
    type: Date,
    required: [true, 'Please add a renewal date']
  },
  paymentMethod: {
    type: String,
    default: 'Card'
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot be more than 200 characters']
  },
  status: {
    type: String,
    enum: ['Active', 'Paused'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
