const userModel = require('../models/user.model')
const passwordReset = require('../models/user.passwordReset')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

const forgotPassword = (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    userModel.findOne({ email })
        .then((result) => {

            if (!result) {
                return res.status(404).json({ message: 'User with this email was not found', error: result })
            }

            passwordReset.findOne({ email })
                .then((existingReset) => {
                    if (existingReset) {
                        const checkExistingToken = jwt.verify(existingReset.token, process.env.JWT_SECRET)
    
                        if (checkExistingToken) {
                            return res.status(400).json({ message: 'A password reset link has already been sent to this email. Please check your inbox.' });
                        } else {
                            passwordReset.deleteOne({ email })
                            .then((result) => {
                                return res.status(400).json({ message: 'Previous password reset link has expired. A new link will be sent to your email shortly.' });
                            });
                        }
                        return res.status(400).json({ message: 'A password reset link has already been sent to this email. Please check your inbox.' });
                    }

                   

                    const token = jwt.sign({ email: result.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
                    // Save the token to the database
                    const newPasswordReset = new passwordReset({ email, token });
                    newPasswordReset.save()
                        .then(() => {
                            console.log("Password reset token saved successfully");
                        })
                        .catch((err) => {
                            console.error("Error saving password reset token:", err);
                            return res.status(500).json({ message: 'Error saving reset token' });
                        });


                    let transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.EMAIL_USER || 'oladoyeajiboye@gmail.com',
                            pass: process.env.GOOGLE_APP_PASSWORD
                        }
                    });

                    const resetLink = `${process.env.APP_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

                    // Password reset email template
                    let mailOptions = {
                        from: `"AuthSys Team" <${process.env.EMAIL_USER || 'oladoyeajiboye@gmail.com'}>`,
                        to: result.email,
                        subject: 'Reset Your AuthSys Password 🔐',
                        html: `
                                <!DOCTYPE html>
                                <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <style>
                                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; }
                                        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #fff7ed 0%, #fff 40%, #fef3c7 100%); }
                                        .header { background: linear-gradient(-45deg, #f89b29 0%, #ff0f7b 100%); padding: 40px 20px; text-align: center; border-radius: 15px 15px 0 0; }
                                        .header h1 { color: white; margin: 0; font-size: 32px; font-weight: 700; }
                                        .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px; }
                                        .content { padding: 40px 30px; background: white; margin: 0; }
                                        .greeting { font-size: 24px; color: #92400e; font-weight: 600; margin: 0 0 15px 0; }
                                        .message { color: #78350f; font-size: 16px; line-height: 1.6; margin: 15px 0; }
                                        .highlight { color: #f89b29; font-weight: 600; }
                                        .warning-box { background: #fed7aa; border-left: 4px solid #f89b29; padding: 20px; border-radius: 8px; margin: 25px 0; }
                                        .warning-box h3 { color: #92400e; margin: 0 0 12px 0; font-size: 16px; }
                                        .warning-box p { color: #78350f; margin: 8px 0; font-size: 14px; }
                                        .cta-button { display: inline-block; background: linear-gradient(-45deg, #f89b29 0%, #ff0f7b 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 25px 0; font-size: 16px; }
                                        .cta-button:hover { opacity: 0.9; }
                                        .code-box { background: #f3f4f6; border: 1px solid #d1d5db; padding: 15px; border-radius: 8px; margin: 20px 0; word-break: break-all; font-family: monospace; color: #374151; font-size: 13px; }
                                        .divider { border: 0; border-top: 2px solid #fef3c7; margin: 25px 0; }
                                        .footer { background: #92400e; color: white; padding: 30px; text-align: center; border-radius: 0 0 15px 15px; }
                                        .footer p { margin: 8px 0; font-size: 14px; }
                                        .expiration { color: #ff6b6b; font-weight: 600; }
                                        .social { margin: 15px 0; }
                                        .social a { color: #f89b29; text-decoration: none; margin: 0 10px; font-weight: 600; }
                                    </style>
                                </head>
                                <body>
                                    <div class="container">
                                        <div class="header">
                                            <h1>🔐 Password Reset Request</h1>
                                            <p>Let's secure your account</p>
                                        </div>
                                        
                                        <div class="content">
                                            <p class="greeting">Hi there! 👋</p>
                                            
                                            <p class="message">
                                                We received a request to reset the password for your AuthSys account associated with <span class="highlight">${result.email}</span>.
                                            </p>
                                            
                                            <p class="message">
                                                Click the button below to create a new password:
                                            </p>
                                            
                                            <center>
                                                <a href="${resetLink}" class="cta-button">Reset Your Password</a>
                                            </center>
                                            
                                            <p class="message" style="font-size: 14px; color: #92400e;">
                                                Or copy this link in your browser:
                                            </p>
                                            <div class="code-box">${resetLink}</div>
                                            
                                            <div class="warning-box">
                                                <h3>⏰ Link Expiration</h3>
                                                <p>
                                                    This password reset link will <span class="expiration">expire in 15 minutes</span>. 
                                                    If you don't reset your password within this time, you'll need to request a new link.
                                                </p>
                                            </div>
                                            
                                            <div class="warning-box" style="background: #dcfce7; border-left-color: #22c55e;">
                                                <h3>🛡️ Safety Tips</h3>
                                                <p>
                                                    • Never share this link with anyone<br>
                                                    • AuthSys staff will never ask for your password<br>
                                                    • Make sure your new password is strong and unique
                                                </p>
                                            </div>
                                            
                                            <p class="message">
                                                <span class="highlight">Didn't request this?</span> Your account may be at risk. 
                                                <a href="${process.env.APP_URL || 'http://localhost:5173'}/signin" style="color: #ff0f7b; text-decoration: none; font-weight: 600;">Sign in</a> 
                                                and change your password immediately, or contact our support team.
                                            </p>
                                            
                                            <hr class="divider">
                                            
                                            <p class="message" style="font-size: 13px; color: #92400e;">
                                                Need help? Contact our support team at 
                                                <a href="mailto:support@authsys.com" style="color: #ff0f7b; text-decoration: none; font-weight: 600;">support@authsys.com</a>
                                            </p>
                                        </div>
                                        
                                        <div class="footer">
                                            <p style="margin-top: 0;"><strong>Account Security Matters</strong></p>
                                            <p>We take your security seriously. Stay vigilant!</p>
                                            
                                            <div class="social">
                                                <a href="https://twitter.com/authsys">Twitter</a>
                                                <a href="https://facebook.com/authsys">Facebook</a>
                                                <a href="https://linkedin.com/company/authsys">LinkedIn</a>
                                            </div>
                                            
                                            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.3); margin: 15px 0;">
                                            
                                            <p style="margin-bottom: 0; font-size: 12px;">
                                                Best Regards,<br>
                                                <strong style="color: #f89b29;">The AuthSys Team</strong>
                                            </p>
                                            
                                            <p style="font-size: 11px; margin-top: 15px; opacity: 0.8;">
                                                © 2026 AuthSys. All rights reserved.<br>
                                                This is an automated email. Please don't reply directly.
                                            </p>
                                        </div>
                                    </div>
                                </body>
                                </html>
                            `
                    };

                    // Send the email
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            return res.status(500).json({ message: 'Error sending reset email. Please try again.' });
                        } else {
                            return res.status(200).json({ message: 'Password reset link sent to your email!' });
                        }
                    });
                })
                .catch((err) => {
                    return res.status(500).json({ message: 'Internal server error' });
                })
        })
        .catch((err) => {
            res.status(500).json({ message: "Internal server error" });
        });
}

module.exports = forgotPassword