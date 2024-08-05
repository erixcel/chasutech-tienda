'use strict'

var express = require('express');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var port = process.env.PORT || 4201;
var functions = require("firebase-functions")
var app = express();
var cors = require('cors');

var server = require('http').createServer(app);

var cliente_routes = require('./routes/cliente');
var admin_routes = require('./routes/admin');
var cupon_routes = require('./routes/cupon');

// Conexion con MongoloDB
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb+srv://ErickFS:Xpoter19@cluster0.jlcqhdz.mongodb.net/tienda',{useUnifiedTopology: true, useNewUrlParser: true}, (err,res)=>{
    if(err){  
        throw err;
        console.log(err);
    }else{
        console.log("Corriendo....");

        // server.listen(port, function(){
        //    console.log("Servidor " + port);
        // });
    }
});


app.use(bodyparser.urlencoded({limit: '50mb',extended:true}));
app.use(bodyparser.json({limit: '50mb', extended: true}));


app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*'); 
    res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods','GET, PUT, POST, DELETE, OPTIONS');
    res.header('Allow','GET, PUT, POST, DELETE, OPTIONS');
    next();
});

app.use(cors({ origin: true }));
app.use('/api',cliente_routes);
app.use('/api',admin_routes);
app.use('/api',cupon_routes);

exports.backend = functions.https.onRequest(app);