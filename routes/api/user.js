const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs')
var cookie = require('cookie-parser')
const jsonwt = require('jsonwebtoken')
const passport = require('passport')
require('../../strategies/jsonwtStrategy')(passport)
const { body, validationResult } = require('express-validator');

// Get settings
const settings = require('../../config/settings');

const User = require('../../models/User');
const req = require('express/lib/request')
const res = require('express/lib/response')

router.use(cookie());

// Test api
router.get('/get', (req, res) => {
    res.send('Hiral Soni');
});

// Register user
// URL : user/register
router.post('/register',
    [
        body('username').notEmpty().withMessage('Username is required'),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        // body('confirm_password')
        //     .notEmpty().withMessage('Confirm password is required')
        //     .custom((value, { req }) => value === req.body.password).withMessage('Passwords must match'),
        body('first_name').notEmpty().withMessage('First name is required'),
        body('last_name').notEmpty().withMessage('Last name is required'),
        body('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Email must be a valid email address'),
        body('phone_number').notEmpty().withMessage('Phone number is required'),
        // body('profile_picture').notEmpty().withMessage('Profile picture is required'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password, first_name, last_name, email, phone_number, profile_picture } = req.body;

        User.findOne({ username })
            .then(existingUser => {
                if (existingUser) {
                    return res.status(400).send('Username already exists');
                }

                const newUser = new User({
                    username,
                    password,
                    first_name,
                    last_name,
                    email,
                    phone_number,
                    profile_picture
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) {
                            return res.status(500).send('Error during password hashing');
                        }

                        newUser.password = hash;

                        newUser.save()
                            .then(savedUser => {
                                res.status(200).json({
                                    status: 200,
                                    message: 'Sign up success',
                                    data: savedUser
                                });
                            })
                            .catch(err => {
                                res.status(500).send('Error during user registration');
                            });
                    });
                });
            })
            .catch(err => {
                res.status(500).send('Error during username validation');
            });
    }
);

// Route to login a user. URL : /user/login
router.post('/login',
    [
        body('username').notEmpty().withMessage('Username is required'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const username = req.body.username;
        const password = req.body.password;

        User.findOne({ username })
            .then(user => {
                if (!user) {
                    return res.status(400).send('Username not found');
                }

                bcrypt.compare(password, user.password)
                    .then(isMatch => {
                        if (isMatch) {
                            const payload = {
                                id: user._id,
                                first_name: user.first_name,
                                last_name: user.last_name,
                                username: user.username
                            };

                            jsonwt.sign(
                                payload,
                                settings.secret,
                                { expiresIn: 3600 },
                                (err, token) => {
                                    if (err) {
                                        return res.status(500).send('Error during token generation');
                                    }

                                    res.json({
                                        status: 200,
                                        success: true,
                                        token: 'Bearer ' + token,
                                        data: user
                                    });
                                }
                            );
                        } else {
                            res.status(401).send('Password is incorrect');
                        }
                    })
                    .catch(err => {
                        res.status(500).send('Error during password comparison');
                    });
            })
            .catch(err => {
                res.status(500).send('Error during username validation');
            });
    }
);

// Display all users. URL: user/users
router.get('/users',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {

        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        const users = await User.find({})
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        res.json({
            status: 200,
            success: true,
            data: users
        });
    });

// Get current user profile. URL: /profile
router.get('/profile',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const userId = req.user.id; // Access the user ID from req.user object
        console.log(userId);

        // Retrieve the user details based on the user ID
        User.findById(userId)
            .then(user => {
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                // Return the user profile information
                res.json({
                    status: 200,
                    success: true,
                    data: user
                });
            })
            .catch(err => {
                res.status(500).json({ error: err.message });
            });
    }
);

// Display single user. URL: GET - user/:id
router.get('/:_id',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {

        const user = await User
            .findById(req.params._id)
            .exec();

        res.json({
            status: 200,
            success: true,
            data: user
        });
    });

// update current user. URL: user/profile
router.put('/profile',
    passport.authenticate('jwt', { session: false }),
    [
        body('first_name').notEmpty().withMessage('First name is required'),
        body('last_name').notEmpty().withMessage('Last name is required'),
        body('profile_picture').notEmpty().withMessage('Profile picture is required'),
        body('phone_number').notEmpty().withMessage('Phone number is required')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id; // Access the user ID from req.user object

        const updateFields = {};

        if (req.body.first_name) {
            updateFields.first_name = req.body.first_name;
        }
        if (req.body.last_name) {
            updateFields.last_name = req.body.last_name;
        }
        if (req.body.profile_picture) {
            updateFields.profile_picture = req.body.profile_picture;
        }
        if (req.body.phone_number) {
            updateFields.phone_number = req.body.phone_number;
        }

        try {
            const user = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true }).exec();

            res.json({
                message: "User updated",
                status: 200,
                success: true,
                data: user
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// Update current user password
// URL : user/update-pwd
router.put('/update-pwd',
    passport.authenticate('jwt', { session: false }),
    [
        body('current_password').notEmpty().withMessage('Current password is required'),
        body('password').notEmpty().withMessage('New password is required'),
        body('confirm_password')
            .notEmpty()
            .withMessage('Confirm password is required')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Password and confirm password must match');
                }
                return true;
            })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user._id;
        const currentPassword = req.body.current_password;
        const newPassword = req.body.password;

        try {
            const user = await User.findById(userId).exec();

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const passwordMatch = await bcrypt.compare(currentPassword, user.password);

            if (!passwordMatch) {
                return res.status(400).json({ message: 'Invalid current password' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            await User.updateOne({ _id: userId }, { password: hashedPassword }).exec();

            res.json({
                status: 200,
                success: true,
                message: 'Password updated'
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// Delete single user. URL: Delete - user/:id
router.delete('/:_id',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {

        User
            .deleteOne({ _id: req.params._id })
            .exec()
            .then(() => {
                res.json({
                    status: 200,
                    success: true,
                    message: 'User deleted'
                });
            })
            .catch((err) => res.status(500).send(err.message));
    });

// Logout URL: user/logout
router.post('/logout',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        req.token = ''; // Passport's logout method
        // Send a response indicating successful logout
        res.status(200).json({ message: 'Logged out successfully' });
    });

module.exports = router;
