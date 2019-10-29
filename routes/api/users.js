const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
const Token = require('../../models/Token');

// @route   POST api/users
// @desc    Register user
// @access  public
router.post(
  '/',
  [
    check('firstName', 'Firstname is required')
      .not()
      .isEmpty(),
    check('lastName', 'Lastname is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password } = req.body;
    try {
      // See if user already exist
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exist' }] });
      }

      // Get user Gravatar
      const avatar = gravatar.url(email, {
        // Configuration for avatar img
        s: '100', // size
        r: 'pg', // rating
        d: 'mm' // default img
      });

      user = new User({
        firstName,
        lastName,
        email,
        avatar,
        password
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      };

      // Generate token for email confirmation
      const token = new Token({
        _userId: user.id,
        token: crypto.randomBytes(16).toString('hex')
      });

      console.log(token);

      await token.save();

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
