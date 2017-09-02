const chalk = require('chalk');
const { Author, Snippet } = require('./models/models.js')

function getAllAuthors(){
  return Author.find();
}

function getAuthorByUsername(username){
  return Author.findOne({ username: username});
}

function getSnipsByUsername(username){
  return Snippet.findOne({ author: username});
}

function getAuthorAndSnips(username){
  return Author.findOne({ username: username})
    .populate('snippets').exec((err, snips) => {
      console.log("combining things " + snips);
    })
}

function createAuthor(newUser){
  const user = new Author(newUser);
  user.save( function(err){
    console.log(err);
  })
  console.log(chalk.keyword('aqua')('>>New Author Created'));
  return Promise.resolve('Success');
}


module.exports = {
  createAuthor,
  getAllAuthors,
  getAuthorByUsername,
  getSnipsByUsername,
  getAuthorAndSnips
}
