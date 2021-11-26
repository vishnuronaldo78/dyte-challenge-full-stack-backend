const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");

const router = express.Router()

const User = require('../models/user')
const Url = require('../models/url')
const verify = require('../middleware/jwt');

router.post('/signup', async (req, res) => {
  const {
    name,
    email,
    username,
    password
  } = req.body
  try {
    const existingUser = await User.findOne({
      username
    })
    if (existingUser) {
      res.status(401).json('User already exists')
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        name,
        email,
        username,
        password: hashedPassword
      })
      await user.save();
      if (user) {
        res.json("User created successfully")
      } else {
        res.status(402).json("User creation failed")
      }
    }
  }
  catch (err) {
    console.error(err)
    res.status(500).json('Server Error')
  }
})

router.post("/login", async (req, res) => {
  const {
    body: { username, password }
  } = req;
  try {
    let currentUser = await User.findOne({ username });
    if (!currentUser) {
      return res
        .status(403)
        .json("Invalid credentials");
    }
    const { password: currentPassword } = currentUser;
    const isPasswordMatched = await bcrypt.compare(password, currentPassword);
    if (!isPasswordMatched) {
      return res
        .status(403)
        .json("Invalid credentials");
    }

    const token = jwt.sign(
      { user_id: currentUser.username },
      "dyte",
      {
        expiresIn: "1d"
      }
    );
    delete currentUser.password
    res.json({
      ...currentUser, token
    });
  } catch (err) {
    res.status(500).json("Server error");
  }
})

router.post("/getUser", verify, async (req, res) => {
  const { username } = req.body;
  try {
    let user = await User.findOne({ username }, { email: 1, username: 1, generatedUrl: 1 });
    if (!user) {
      return res
        .status(403)
        .json("Invalid credentials");
    }
    let urlIds = user.generatedUrl
    let urlDetails = []
    if (urlIds.length > 0) {
      urlDetails = await Url.find({
        _id: { $in: urlIds }
      })
    }
    user = { ...user._doc, urlDetails }
    res.json(user)
  } catch (err) {
    res.status(500).json("Server error");
  }
})


module.exports = router