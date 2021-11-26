const express = require('express')
var geoip = require('geoip-lite');

const router = express.Router()

const Url = require('../models/url')

router.get('/:code', async (req, res) => {
  var geo = geoip.lookup(req.ip);
  try {
    const url = await Url.findOne({
      urlCode: req.params.code
    })
    if (url) {
      if(+new Date(url.date) > url.expiresAt) {
        return res.status(404).type('txt').send('Not found')
      }
      let browserObject = {
        browser: req.headers["user-agent"],
        language: req.headers["accept-language"],
        country: (geo ? geo.country : "Unknown"),
        region: (geo ? geo.region : "Unknown")
      }
      let updateUrl = await Url.findOneAndUpdate({
        _id: url._id
      }, {
        $set: {
          views: url.views ? (url.views + 1) : 1
        },
        $push: {
          ipDetails: req.ip,
          browserDetails: browserObject
        }
      })
      return res.redirect(url.longUrl)
    } else {
      return res.status(404).type('txt').send('Not found')
    }
  }
  catch (err) {
    console.error(err)
    res.status(500).json('Server Error')
  }
})


module.exports = router