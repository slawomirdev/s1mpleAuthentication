//jshint esversion:6
require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 3000
const ejs = require('ejs')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
// const bcrypt = require('bcrypt')
// const saltRounds = 10;

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
)

app.use(passport.initialize())
app.use(passport.session())

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

mongoose.set('useCreateIndex', true)

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
})

userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model('User', userSchema)

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.get('/register', (req, res) => {
  res.render('register')
})

app.get('/secrets', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('secrets')
  } else {
    res.redirect('/login')
  }
})

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

app.post('/register', (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err)
        res.redirect('/register')
      } else {
        passport.authenticate('local')(req, res, function () {
          res.redirect('/secrets')
        })
      }
    }
  )
})

app.post(
  '/login',

  passport.authenticate('local', { failureRedirect: '/login' }),

  function (req, res) {
    res.redirect('/secrets')
  }
)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
