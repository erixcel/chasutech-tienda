'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'chasutech2023';

exports.createToken = function(user){
    var payload = {
        sub: user._id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        password: user.password,
        f_nacimiento: user.f_nacimiento,
        iat: moment().unix(),
        exp: moment().add(1,'day').unix()
    }
    return jwt.encode(payload,secret);
}

exports.mostrarDatosToken = function(token) {
    try {
        var datos = jwt.decode(token, secret);
        return datos;
    } catch (err) {
        console.error('El token no es válido:', err);
        return null;
    }
}
