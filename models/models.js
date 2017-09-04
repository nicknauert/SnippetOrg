//schema for user obj
//pointed to users collection
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');



const AuthorSchema = new mongoose.Schema({
  username: String,
  password: String,
  info: {
    name: String,
    postCount: Number,
    about: String,
    website: String,
    avatar: String,
    starred: [{type: String}],
    city: String,
    country: String
  },
  snippets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Snippet' }],
})


const SnippetSchema = new mongoose.Schema({
  title: String,
  description: String,
  content: String,
  created: Date,
  language: String,
  stars: Number,
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'Author'},
  tags: [{type: String}]
})


AuthorSchema.pre('save', function(next) {
  const user = this
  if (!user.isModified('password')) {
    next()
  }
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      user.password = hash
      next()
    })
  })
})

AuthorSchema.methods.comparePassword = function(pwd, dbPass, done) {
  bcrypt.compare(pwd, dbPass, (err, isMatch) => {
    done(err, isMatch)
  })
}


const Snippet = mongoose.model('Snippet', SnippetSchema);
const Author = mongoose.model('Author', AuthorSchema);


module.exports = {
  Snippet, Author,
}
