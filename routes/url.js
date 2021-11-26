const express = require('express')
const validUrl = require('valid-url')

const router = express.Router()
const Url = require('../models/url')
const User = require('../models/user')
const verify = require('../middleware/jwt');


const baseUrl = 'http:localhost:5000'

function getrandom() {
  var random_string = Math.random().toString(32).substring(2, 5) + Math.random().toString(32).substring(2, 5);
  return random_string
}

router.post('/shorten', verify, async (req, res) => {
  const {
    longUrl, custom
  } = req.body
  const { id } = req.user
  let urlCode
  if (!custom) {
    urlCode = await getrandom();
  } else {
    urlCode = custom;
  }

  if (validUrl.isUri(longUrl)) {
    try {
      let url = await Url.findOne({
        longUrl
      })
      if (url) {
        res.json(url)
      } else {
        const shortUrl = baseUrl + '/' + urlCode
        url = new Url({
          longUrl,
          shortUrl,
          urlCode,
          date: new Date(),
          expiresAt: (+new Date() + (24 * 3600 * 1000))
        })
        await url.save()
        await User.findOneAndUpdate(
          { username: id },
          {
            $push: { generatedUrl: url._id }
          })
        res.json(url)
      }
    }
    catch (err) {
      console.log(err)
      res.status(500).json('Server Error')
    }
  } else {
    res.status(401).json('Invalid Url')
  }
})

module.exports = router