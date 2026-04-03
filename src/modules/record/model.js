const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['income', 'expense']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  note: {
    type: String,
    trim: true,
    maxlength: [200, 'Note cannot exceed 200 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
recordSchema.index({ createdBy: 1, date: -1 });
recordSchema.index({ type: 1, category: 1 });
recordSchema.index({ isDeleted: 1 });

// Virtual for formatted amount
recordSchema.virtual('formattedAmount').get(function() {
  return this.type === 'income' ? `+$${this.amount.toFixed(2)}` : `-$${this.amount.toFixed(2)}`;
});

// Ensure virtuals are included in JSON output
recordSchema.set('toJSON', { virtuals: true });
recordSchema.set('toObject', { virtuals: true });

// Soft delete method
recordSchema.methods.softDelete = function() {
  this.isDeleted = true;
  return this.save();
};

// Restore method
recordSchema.methods.restore = function() {
  this.isDeleted = false;
  return this.save();
};

// Static method to find non-deleted records
recordSchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, isDeleted: false });
};

module.exports = mongoose.model('Record', recordSchema);
