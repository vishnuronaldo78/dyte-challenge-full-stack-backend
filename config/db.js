const mongoose = require('mongoose')

const DB_URI = 'mongodb+srv://vishnu:vishnu@dyte.p55t8.mongodb.net/dyte?retryWrites=true&w=majority'

mongoose.connect(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const connection = mongoose.connection


module.exports = connection