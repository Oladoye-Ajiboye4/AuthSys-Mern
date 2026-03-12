const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model')


const handleSignin = (req, res) => {
  const userData = req.body;

  userModel.findOne({ email: userData.email })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
    })

  const token = jwt.sign(
    {
      email: userData.email,
      username: userData.username,
      provider: userData.provider
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  userData.token = token;
  userData.password = "N/A";
  const newUser = new userModel(userData);
  newUser.save();

  // Returns JWT token, not the provider's token
  res.status(201).json({
    message: 'Success',
    user: {
      ...userData,
      token: token
    }
  });
};

module.exports = handleSignin;