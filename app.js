const express = require('express');
const app = express();
const mustache = require('mustache-Express');
const {
  createAuthor,
  getAllAuthors,
  getAuthorByUsername,
  getSnipsByUsername,
  getAuthorAndSnips,
  getAllSnippets,
  createSnippet,
  searchSnippets
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


// mongoose.connect('mongodb://localhost:27017/snippetdb');

var MongoClient = require('mongodb').MongoClient;

var uri = "mongodb://kay:" + process.env.PASSWORD + "@mycluster0-shard-00-00-wpeiv.mongodb.net:27017,mycluster0-shard-00-01-wpeiv.mongodb.net:27017,mycluster0-shard-00-02-wpeiv.mongodb.net:27017/admin?ssl=true&replicaSet=Mycluster0-shard-0&authSource=admin";
MongoClient.connect(uri, function(err, db) {
  db.close();
});

app.engine('mustache', mustache())
app.set('view engine', 'mustache')
app.set('views', __dirname + '/views')


////////////// MIDDLEWARE //////////////

app.use(express.static('./frontend/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(session({
  secret: 'mudlark',
  resave: false,
  saveUninitialized: true
}))


////////////////// ROUTES ///////////////
/*
login -get -post
feed -get -post(search)
snippet -get
author -get
author/starred -get
author(self) -get -post
create snippet -get -post
*/


//////////// Content Routes /////////////////

app.get('/feed', ensureAuthentication, (req, res) => {
  getAllSnippets().then((snippets) => {
    let decoded = jwt.decode(req.session.jwtToken.token)
    console.log(decoded);
    res.render('feed', {snips: snippets.reverse()})
  })
})

app.post('/feed', ensureAuthentication, (req, res) => {
  searchSnippets(req.body.searchInput).then((snippets) => {
    res.render('feed', {snips: snippets.reverse()})
  })
})

app.get('/author/:username', ensureAuthentication, ({params}, res) => {
  getAuthorAndSnips(params.username).then((foundAuthor) => {
    res.render('authorPg', {author: foundAuthor});
  })
}) //make this include a self page

app.get('/authors', ensureAuthentication, (req, res) => {
  getAllAuthors().then((authors) => {
    res.render('authors', {authors})
  })
})

app.get('/create', ensureAuthentication, (req, res) => {
    res.render('create')
})
app.post('/create', ensureAuthentication, (req, res) => {
    createSnippet(req.body, req.session.jwtToken.token);

    res.redirect('/feed')
})

app.get('/logout', (req, res) => {
  req.session.jwtToken = null
  res.redirect('/login')
})



////////// LOGIN ROUTES ////////////

app.get('/', (req, res) => {
  if(req.session.jwtToken){
    res.redirect('/feed')
  }
  res.redirect('/login')

})

app.get('/signup', (req, res) => {
  res.render('signup');
})

app.post('/signup', (req, res) => {
  createAuthor(req.body).then((newAuthor) => {
    res.redirect('/login')
  })
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', (req, res) => {
  Author.findOne({ username: req.body.username }, 'username password', function (err, user, next) {
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
      req.session.jwtToken = token;
      res.redirect('/');
    })
  })
})


app.set('port', process.env.PORT || 3000)
app.listen(app.get('port'), function(req, res){
  console.log("App started on 3000.")
})
