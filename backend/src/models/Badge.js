const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    ownerName: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'security'],
      default: 'user'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Badge', badgeSchema);
