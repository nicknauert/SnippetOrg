


function getToken () {
  const token = window.localStorage.getItem('token')
  if (token) {
    return token
  } else {
    console.log('something went wrong')
  }
}
function setToken (token) {
  window.localStorage.setItem('token', token)
  return token
}
function removeToken () {
  window.localStorage.removeItem('token')
}
