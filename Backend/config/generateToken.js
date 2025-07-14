const jwt = require('jsonwebtoken')

const generateToken = (id) =>{
    return jwt.sign({id} , 'savita',{expiresIn:"30d"})

}
module.exports = generateToken;