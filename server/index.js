const mongoose = require('./connection/connection')
// const handleSignup = require('./auth/signup')
const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')

app.use(cors)

const PORT = process.env.port || 7890;

app.post('/handle-signup', (req, res) => {
  const userData = req.body.user 
  console.log(req.body)
  res.status(200).json({message: 'Sucess', user})
  
})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})
