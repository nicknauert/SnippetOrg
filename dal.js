const chalk = require('chalk');
const { Author, Snippet } = require('./models/models.js');
const moment = require('moment')
const jwt = require('jsonwebtoken')

function getAllAuthors(){
  return Author.find();
}

function getAuthorByUsername(username){
  return Author.findOne({ username: username});
}

function getSnipsByUsername(username){
  return Snippet.findOne({ author: username});
}

function getAllSnippets(){
  return Snippet.find().populate('author');
}

function getSingleSnippet(id){
  return Snippet.findOne({ _id: id }).populate('author');
}

function searchSnippets(search){

  return Snippet.find({ $or: [
    {title: {$regex : search, $options: "i" }},
    { description: {$regex : search, $options: "i" }},
    { content: {$regex : search, $options: "i" }},
    { tags: {$regex : search, $options: "i" }},
    { language: {$regex : search, $options: "i" }}
    ]})
    .populate('author');
}

function getAuthorAndSnips(username){
  return Author.findOne({ username: username })
    .populate('snippets')
}

function createAuthor(newUser){
  const user = new Author(newUser);
  user.save( function(err){
    console.log(err);
  })
  console.log(chalk.keyword('aqua')('>>New Author Created'));
  return Promise.resolve('Success');
}

function starSnippet(snipId, userId){

}

function createSnippet(newSnip, token) {
  let decoded = jwt.decode(token);
  let splitTags = newSnip.tags.split(' ');
  let fullSnip = {
    title: newSnip.title,
    description: newSnip.description,
    content: newSnip.content,
    created: new Date(),
    language: newSnip.language,
    stars: 0,
    author: decoded.sub,
    tags: splitTags
  };
  const snippet = new Snippet(fullSnip);
  snippet.save( function(err) {
    console.log(err);
  })

  getAuthorByUsername(decoded.user).then((author)=>{
    author.snippets.push(snippet._id);
    author.save(function(err){
      console.log(err);
    });
  })
}


module.exports = {
  createAuthor,
  getAllAuthors,
  getAuthorByUsername,
  getSnipsByUsername,
  getAuthorAndSnips,
  getAllSnippets,
  getSingleSnippet,
  createSnippet,
  searchSnippets
}
