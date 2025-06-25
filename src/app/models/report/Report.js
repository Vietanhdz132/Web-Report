const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  week: Number,
  number: String,
  createdAt: Date,
  signer: String,
  position: String,
  receivers: String,
  sections: [
    {
      title: String,
      items: [
        {
          type: { type: String, enum: ['text', 'table'] },
          title: String,
          content: String,         // for type: text
          rows: [[String]]         // for type: table
        }
      ]
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
