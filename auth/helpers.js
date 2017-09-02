const jwt = require('jsonwebtoken');
const moment = require('moment');

function createToken(user) {
  const payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(1, 'day').unix(),
    user: user.info.username
  }
  return jwt.sign(payload, process.env.TOKEN_SECRET)
}

function ensureAuthentication(req, res, next){
  if (!req.headers.authorization){
    return res.status(401).send({message: 'Nah.' })
  }
  const token = req.headers.authorization.split(' ')[1]
  const payload = jwt.verify(token, process.env.TOKEN_SECRET)
  if(exp <= moment().unix()){
    return res.status(401).send({message: 'Token is too old man.' })
  }
  req.user = payload;
  next();
}

module.exports = {
  createToken, ensureAuthentication
}
