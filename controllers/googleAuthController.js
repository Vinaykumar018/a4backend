const axios = require('axios');
const jwt = require('jsonwebtoken');
const { oauth2Client } = require('../utils/googleClient');
const User = require('../model/userModel');

exports.googleAuth = async (req, res) => {
  const code = req.query.code;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
    );

    const { email, name, picture } = userRes.data;

    let user = await User.findOne({ email });

    if (!user) {
      const username = name.toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 1000);
      user = await User.create({
        name,
        email,
        username,
        profile_image: picture,
        social_type: 'google',
      });
    }

    const token = jwt.sign(
      { _id: user._id, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_TIMEOUT }
    );

    res.status(200).json({
      message: 'success',
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Internal Server Error',
      err,
    });
  }
};
