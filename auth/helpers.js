const jwt = require('jsonwebtoken');
const moment = require('moment');

function createToken(user) {
  const payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(1, 'day').unix(),
    user: user.username
  }
  return jwt.sign(payload, process.env.TOKEN_SECRET)
}

function ensureAuthentication(req, res, next){
  if (!req.session.jwtToken){
    res.redirect('/login')
  }
  const token = req.session.jwtToken.token
  const payload = jwt.verify(token, process.env.TOKEN_SECRET)
  const decoded = jwt.decode(token)
  if(decoded.exp <= moment().unix()){
    return res.status(401).send({message: 'Token is too old man.' })
  }
  req.user = payload;
  next();
}

module.exports = {
  createToken, ensureAuthentication
}
