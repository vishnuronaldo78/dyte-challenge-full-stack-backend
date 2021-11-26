const mongoose = require('mongoose')

const URLSchema = new mongoose.Schema({
  urlCode: String,
  longUrl: String,
  shortUrl: String,
  date: {
    type: String,
    default: Date.now
  },
  expiresAt: Number,
  views: Number,
  ipDetails: Array,
  browserDetails: Array
})

module.exports = mongoose.model('Url', URLSchema)