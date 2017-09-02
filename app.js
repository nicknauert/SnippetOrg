const express = require('express');
const app = express();
const mustache = require('mustache-Express');
const {
  createAuthor,
  getAllAuthors,
  getAuthorByUsername,
  getSnipsByUsername,
  getAuthorAndSnips
} = require('./dal');
const chalk = require('chalk');
const bodyParser = require('body-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
const {Author, Snippet} = require('./models/models.js');
const { createToken, ensureAuthentication } = require('./auth/helpers.js')
require('dotenv').config()


mongoose.connect('mongodb://localhost:27017/snippetdb');

app.engine('mustache', mustache())
app.set('view engine', 'mustache')
app.set('views', __dirname + '/views')


////////////// MIDDLEWARE //////////////

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}))


////////////////// ROUTES ///////////////
/*
login -get -post
feed -get
snippet -get
user -get
user/starred -get
user(self) -get -post
create snippet -get -post
*/

app.get('/signup', (req, res) => {
  res.render('signup');
})

app.post('/signup', (req, res) => {
  createAuthor(req.body).then((newUAuthor) => {
    res.redirect('/login');
  })
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', (req, res) => {
  Author.findOne({ username: req.body.username }, 'username password', function (err, user, next) {
    console.log(user);
    if (err) return next(err)
    if (!user) {
      return res.status(401).send({ message: 'Wrong email and/or password' })
    }
    user.comparePassword(req.body.password, user.password, function ( err, isMatch ) {
      console.log('is match', isMatch)
      if (!isMatch) {
        return res.status(401).send({ message: 'Wrong email and/or password' })
      }
      let token = { token: createToken(user)};
      window.localStorage.setItem(token);
    })
  })
})



app.get('/feed', (req, res) => {
  getAllAuthors().then((authors) => {
    res.render('feed', {authors})
  })
})

app.get('/author/:username', ({params}, res) => {

  getAuthorAndSnips(params.username).then((foundAuthor) => {
    res.render('authorPg', {author: foundAuthor})
  })
})


app.listen(3000, () => {
  console.log(chalk.green('Snippets running on 3000. Better catch em.'))
})
