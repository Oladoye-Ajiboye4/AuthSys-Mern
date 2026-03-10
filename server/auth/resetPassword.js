const userModel = require('../models/user.model')
const PasswordReset = require('../models/user.passwordReset')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const resetPassword = (req, res) => {
    const { token, password } = req.body

    if (!token || !password) {
        return res.status(400).json({ message: 'Token and new password are required' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        userModel.findOne({ email })
            .then((user) => {
                if (!user) {
                    return res.status(404).json({ message: 'User not found' })
                }

                let salt = bcrypt.genSaltSync(10);
                let hashedPassword = bcrypt.hashSync(password, salt);

                user.password = hashedPassword
                user.save()
                    .then((result) => {
                        PasswordReset.deleteOne({ email })
                            .then((result) => {
                                return res.status(200).json({ message: 'Password reset successful' })
                            })
                            .catch((err) => {
                                return res.status(500).json({ message: 'Internal server error', error: err })
                            })
                    })
                    .catch((err) => {
                        res.status(500).json({ message: 'Internal server error', error: err })
                    })

            })
            .catch((err) => {
                res.status(500).json({ message: 'Internal server error', error: err })


            })
    } catch (err) {
        return res.status(400).json({ message: 'Invalid or expired token', error: err })
    }
}

module.exports = resetPassword