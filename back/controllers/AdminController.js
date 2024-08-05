var Admin = require('../models/Admin');
var Config = require('../models/Config');
var Etiqueta = require('../models/Etiqueta');
var Variedad = require('../models/Variedad');
var Inventario = require('../models/Inventario');
var Producto = require('../models/Producto');
var Producto_etiqueta = require('../models/Producto_etiqueta');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');

var Venta = require('../models/Venta');
var Dventa = require('../models/Dventa');
var Carrito = require('../models/Carrito');

var fs = require('fs');
var formidable = require('formidable-serverless');
var handlebars = require('handlebars');
var ejs = require('ejs');
var nodemailer = require('nodemailer');

const { uploadImage, removeImage } = require('../helpers/CloudStorage');
const { v4: uuidv4 } = require('uuid');

const mercadopago = require('mercadopago');
const { MERCADOPAGO_APIKEY, GMAIL, PASSWORD } = require('../config');

mercadopago.configure({
    access_token: MERCADOPAGO_APIKEY,
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: `${GMAIL}`,
      pass: `${PASSWORD}`,
    }
});

const login_admin = async function(req,res){
    var data = req.body;
    var admin_arr = [];

    admin_arr = await Admin.find({email:data.email});

    if(admin_arr.length == 0){
        res.status(200).send({message: 'El correo electrónico no existe', data: undefined});
    }else{
        //LOGIN
        let user = admin_arr[0];

        bcrypt.compare(data.password, user.password, async function(error,check){
            if(check){
                res.status(200).send({
                    data:user,
                    token: jwt.createToken(user)
                });
            }else{
                res.status(200).send({message: 'Las credenciales no coinciden', data: undefined}); 
            }
        });
 
    } 
}

const listar_etiquetas_admin = async function(req,res){
    if(req.user){
        var reg = await Etiqueta.find();
        res.status(200).send({data:reg});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const eliminar_etiqueta_admin = async function(req,res){
    if(req.user){
        var id = req.params['id'];

        let reg = await Etiqueta.findByIdAndRemove({_id:id});
        res.status(200).send({data:reg});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const agregar_etiqueta_admin = async function(req,res){
    if(req.user){
        try {
            let data = req.body;
            data.titulo = data.titulo.trim();
            data.slug = data.titulo.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g,'-').replace(/[^\w-]+/g,'');
            var reg = await Etiqueta.create(data);
            res.status(200).send({data:reg});
        } catch (error) {
            res.status(200).send({data:undefined,message:'Etiqueta ya existente'});
            
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const registro_producto_admin = async function(req,res){
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if(req.user){
            let data = fields;
            const slug = data.titulo.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g,'-').replace(/[^\w-]+/g,'');
            let productos = await Producto.find({slug:slug});
            let arr_etiquetas = JSON.parse(data.etiquetas);
    
            if(productos.length == 0){
                const file = files.portada
                const buffer = await fs.promises.readFile(file.path);
                let producto = new Producto(data);
                const imagen_url = uploadImage(`productos/${producto._id}/portada`, { buffer, type: file.type });
                const id_galeria = uuidv4();
                producto.portada = imagen_url;
                producto.galeria = [{_id:id_galeria, imagen: imagen_url}]
                producto.titulo = data.titulo.trim();
                producto.slug = slug;
    
                let reg = await producto.save();
    
                if(arr_etiquetas.length >= 1){
                    for(var item of arr_etiquetas){
                        Producto_etiqueta.create({
                            etiqueta: item.etiqueta,
                            producto: reg._id,
                        });
                    }
                }
    
                res.status(200).send({data:reg});
            }else{
                res.status(200).send({data:undefined, message: 'El título del producto ya existe'});
            }
        }else{
            res.status(500).send({message: 'NoAccess'});
        }
    });
}



const listar_productos_admin = async function(req,res){
    if(req.user){
        var productos = await Producto.find().sort({createdAt: -1});
        res.status(200).send({data:productos});
    }else{
        res.status(500).send({message: 'NoAccess'});
    } 
}

const listar_variedades_productos_admin = async function(req,res){
    if(req.user){
        var productos = await Variedad.find().populate('producto');
        res.status(200).send({data:productos});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const obtener_producto_admin = async function(req,res){
    if(req.user){
        var id = req.params['id'];

        try {
            var reg = await Producto.findById({_id:id});
            res.status(200).send({data:reg});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const listar_etiquetas_producto_admin = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        var etiquetas = await Producto_etiqueta.find({producto:id}).populate('etiqueta');
        res.status(200).send({data:etiquetas});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const eliminar_etiqueta_producto_admin = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        let reg = await Producto_etiqueta.findByIdAndRemove({_id:id});
        res.status(200).send({data:reg});
        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const agregar_etiqueta_producto_admin = async function(req,res){
    if(req.user){
        let data = req.body;

        var reg = await Producto_etiqueta.create(data);
        res.status(200).send({data:reg});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const actualizar_producto_admin = async function(req,res){
    let id = req.params['id'];           
    if(req.user){
        if (!req.headers['content-type'].includes('multipart/form-data')) {
            let data = req.body
            let reg = await Producto.findByIdAndUpdate({_id:id},{
                titulo: data.titulo.trim(),
                stock: data.stock,
                precio_antes: data.precio_antes,
                precio: data.precio,
                peso: data.peso,
                sku: data.sku,
                estrellas: data.estrellas,
                slug: data.titulo.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g,'-').replace(/[^\w-]+/g,''),
                categoria: data.categoria,
                visibilidad: data.visibilidad,
                descripcion: data.descripcion,
                contenido: data.contenido,
            });
            res.status(200).send({data:reg});
        } else {
            const form = new formidable.IncomingForm();
            form.parse(req, async (err, fields, files) => {
                let data = fields;
                if(files){
                    const file = files.portada
                    const buffer = await fs.promises.readFile(file.path);
                    const imagen_url = uploadImage(`productos/${id}/portada`, { buffer, type: file.type });
                    const id_galeria = uuidv4();
        
                    let reg = await Producto.updateOne(
                        { _id: id },
                        { 
                            $set: { 
                                'galeria.0._id': id_galeria,
                                'galeria.0.imagen': imagen_url,
                                titulo: data.titulo.trim(),
                                stock: data.stock,
                                precio_antes: data.precio_antes,
                                precio: data.precio,
                                peso: data.peso,
                                sku: data.sku,
                                estrellas: data.estrellas,
                                slug: data.titulo.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g,'-').replace(/[^\w-]+/g,''),
                                categoria: data.categoria,
                                visibilidad: data.visibilidad,
                                descripcion: data.descripcion,
                                contenido:data.contenido,
                                portada: imagen_url
                            } 
                        }
                    );
        
                    res.status(200).send({data:reg});
                }
            })
        }
    } else {
        res.status(500).send({message: 'NoAccess'});
    }
}

const listar_variedades_admin = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        let data = await Variedad.find({producto:id});
        res.status(200).send({data:data});
        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const actualizar_variedad_admin = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let data = req.body;

        let reg = await Variedad.findByIdAndUpdate({_id:id},{
            valor: data.valor,
        });
        res.status(200).send({data:reg});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const eliminar_variedad_admin = async function(req,res){
    if(req.user){
        var id = req.params['id'];

        let reg = await Variedad.findByIdAndRemove({_id:id});
        res.status(200).send({data:reg});
            
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const agregar_nueva_variedad_admin = async function(req,res){
    if(req.user){
        var data = req.body;
        let reg = await Variedad.create(data);

        res.status(200).send({data:reg});
        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}


const listar_inventario_producto_admin = async function(req,res){
    if(req.user){
        var id = req.params['id'];

        var reg = await Inventario.find({producto: id}).populate('variedad').sort({createdAt:-1});
        res.status(200).send({data:reg});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const registro_inventario_producto_admin = async function(req,res){
    if(req.user){
        let data = req.body;

        let reg = await Inventario.create(data);

        //OBTENER EL REGISTRO DE PRODUCTO
        let prod = await Producto.findById({_id:reg.producto});
        let varie = await Variedad.findById({_id:reg.variedad});

        //CALCULAR EL NUEVO STOCK        
        //STOCK ACTUAL         
        //STOCK A AUMENTAR
        let nuevo_stock = parseInt(prod.stock) + parseInt(reg.cantidad);

        let nuevo_stock_vari = parseInt(varie.stock) + parseInt(reg.cantidad);

        //ACTUALICACION DEL NUEVO STOCK AL PRODUCTO
        let producto = await Producto.findByIdAndUpdate({_id:reg.producto},{
            stock: nuevo_stock
        });

        let variedad = await Variedad.findByIdAndUpdate({_id:reg.variedad},{
            stock: nuevo_stock_vari
        });

        res.status(200).send({data:reg});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const agregar_imagen_galeria_admin = async (req, res) => {

    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if(req.user){
            let id = req.params['id'];
            let data = fields;
            const file = files.imagen;
            const buffer = await fs.promises.readFile(file.path);
            var url_imagen = uploadImage(`productos/${id}/galeria/${data._id}`, { buffer, type: file.type });

            let reg = await Producto.findByIdAndUpdate({_id:id},{ $push: {galeria:{
                imagen: url_imagen,
                _id: data._id
            }}});
            res.status(200).send({data:reg});
        } else {
            res.status(500).send({message: 'NoAccess'});
        }
    });
}

const eliminar_imagen_galeria_admin = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let data = req.body;
        let reg = await Producto.findByIdAndUpdate({_id:id},{$pull: {galeria: {_id:data._id}}});
        removeImage(`productos/${id}/galeria/${data._id}`);
        res.status(200).send({data:reg});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const verificar_token = async function(req,res){
    if(req.user){
        res.status(200).send({data:req.user});
    }else{
        res.status(500).send({message: 'NoAccess'});
    } 
}

const cambiar_vs_producto_admin = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        var estado = req.params['estado'];

        try {
            if(estado == 'Edicion'){
                await Producto.findByIdAndUpdate({_id:id},{estado:'Publicado'});
                res.status(200).send({data:true});
            }else if(estado == 'Publicado'){
                await Producto.findByIdAndUpdate({_id:id},{estado:'Edicion'});
                res.status(200).send({data:true});
            }
        } catch (error) {
            res.status(200).send({data:undefined});
        }
        
     }else{
         res.status(500).send({message: 'NoAccess'});
     }
}

const obtener_config_admin = async (req,res)=>{
    let config = await Config.findById({_id:'61abe55d2dce63583086f108'});
    res.status(200).send({data:config});
}

const actualizar_config_admin = async (req,res)=>{
    if(req.user){
        let data = req.body;
        let config = await Config.findByIdAndUpdate({_id:'61abe55d2dce63583086f108'},{
            envio_activacion : data.envio_activacion,
            monto_min_soles: data.monto_min_soles,
            monto_min_dolares : data.monto_min_dolares
        });
        res.status(200).send({data:config});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}

const pedido_compra_cliente = async function(req,res){
    if(req.user){
        try {
            var data = req.body;
            var detalles = data.detalles;
            let access = false;
            let producto_sl = '';

            for(var item of detalles){
                let variedad = await Variedad.findById({_id:item.variedad}).populate('producto');
                if(variedad.stock < item.cantidad){
                    access = true;
                    producto_sl = variedad.producto.titulo;
                }
            }

            if(!access){
                data.estado = 'En espera';
                let venta = await Venta.create(data);
        
                for(var element of detalles){
                    element.venta = venta._id;
                    await Dventa.create(element);
                    await Carrito.remove({cliente:data.cliente});
                }
                res.status(200).send({venta:venta});
            }else{
                res.status(200).send({venta:undefined,message:'Stock insuficiente para ' + producto_sl});
            }
        } catch (error) {
            console.log(error);
        }

        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}


const enviar_email_pedido_compra = async function(venta){
    try {
        var readHTMLFile = function(path, callback) {
            fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                if (err) {
                    throw err;
                    callback(err);
                }
                else {
                    callback(null, html);
                }
            });
        };

        var orden = await Venta.findById({_id:venta}).populate('cliente').populate('direccion');
        var dventa = await Dventa.find({venta:venta}).populate('producto').populate('variedad');
    
    
        readHTMLFile(process.cwd() + '/mails/email_pedido.html', (err, html)=>{
                                
            let rest_html = ejs.render(html, {orden: orden, dventa:dventa});
    
            var template = handlebars.compile(rest_html);
            var htmlToSend = template({op:true});
    
            var mailOptions = {
                from: `${GMAIL}`,
                to: orden.cliente.email,
                subject: 'Gracias por tu orden, Prágol.',
                html: htmlToSend
            };
          
            transporter.sendMail(mailOptions, function(error, info){
                if (!error) {
                    console.log('Email sent: ' + info.response);
                }
            });
        
        });
    } catch (error) {
        console.log(error);
    }
} 

const obtener_ventas_admin  = async function(req,res){
    if(req.user){
        let ventas = [];
            let desde = req.params['desde'];
            let hasta = req.params['hasta'];

            ventas = await Venta.find().populate('cliente').populate('direccion').sort({createdAt:-1});
            res.status(200).send({data:ventas});

            
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const obtener_detalles_ordenes_cliente  = async function(req,res){
    if(req.user){
        var id = req.params['id'];

        try {
            let venta = await Venta.findById({_id:id}).populate('direccion').populate('cliente');
            let detalles = await Dventa.find({venta:venta._id}).populate('producto').populate('variedad');
            res.status(200).send({data:venta,detalles:detalles});

        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined});
        }
        
        
        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const marcar_finalizado_orden = async function(req,res){
    if(req.user){

        var id = req.params['id'];
        let data = req.body;

        var venta = await Venta.findByIdAndUpdate({_id:id},{
            estado: 'Finalizado'
        });

        res.status(200).send({data:venta});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const eliminar_orden_admin = async function(req,res){
    if(req.user){

        var id = req.params['id'];

        var venta = await Venta.findOneAndRemove({_id:id});
        await Dventa.remove({venta:id});

        res.status(200).send({data:venta});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const marcar_envio_orden = async function(req,res){
    if(req.user){

        var id = req.params['id'];
        let data = req.body;

        var venta = await Venta.findByIdAndUpdate({_id:id},{
            tracking: data.tracking,
            estado: 'Enviado'
        });

        res.status(200).send({data:venta});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const confirmar_pago_orden = async function(req,res){
    if(req.user){

        var id = req.params['id'];
        let data = req.body;

        var venta = await Venta.findByIdAndUpdate({_id:id},{
            estado: 'Procesando'
        });

        var detalles = await Dventa.find({venta:id});
        for(var element of detalles){
            let element_producto = await Producto.findById({_id:element.producto});
            let new_stock = element_producto.stock - element.cantidad;
            let new_ventas = element_producto.nventas + 1;

            let element_variedad = await Variedad.findById({_id:element.variedad});
            let new_stock_variedad = element_variedad.stock - element.cantidad;

            await Producto.findByIdAndUpdate({_id: element.producto},{
                stock: new_stock,
                nventas: new_ventas
            });

            await Variedad.findByIdAndUpdate({_id: element.variedad},{
                stock: new_stock_variedad,
            });
        }

        res.status(200).send({data:venta});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}


const mail_confirmar_envio = async function(venta){
    try {
        var readHTMLFile = function(path, callback) {
            fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                if (err) {
                    throw err;
                    callback(err);
                }
                else {
                    callback(null, html);
                }
            });
        };
     
        var orden = await Venta.findById({_id:venta}).populate('cliente').populate('direccion');
        var dventa = await Dventa.find({venta:venta}).populate('producto').populate('variedad');
    
    
        readHTMLFile(process.cwd() + '/mails/email_enviado.html', (err, html)=>{
                                
            let rest_html = ejs.render(html, {orden: orden, dventa:dventa});
    
            var template = handlebars.compile(rest_html);
            var htmlToSend = template({op:true});
    
            var mailOptions = {
                from: `${GMAIL}`,
                to: orden.cliente.email,
                subject: 'Tu pedido ' + orden._id + ' fué enviado',
                html: htmlToSend
            };
          
            transporter.sendMail(mailOptions, function(error, info){
                if (!error) {
                    console.log('Email sent: ' + info.response);
                }
            });
        
        });
    } catch (error) {
        console.log(error);
    }
} 

const enviar_orden_compra = async function(venta){
    try {
        var readHTMLFile = function(path, callback) {
            fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                if (err) {
                    throw err;
                    callback(err);
                }
                else {
                    callback(null, html);
                }
            });
        };
     
        var orden = await Venta.findById({_id:venta}).populate('cliente').populate('direccion');
        var dventa = await Dventa.find({venta:venta}).populate('producto').populate('variedad');
    
    
        readHTMLFile(process.cwd() + '/mails/email_compra.html', (err, html)=>{
                                
            let rest_html = ejs.render(html, {orden: orden, dventa:dventa});
    
            var template = handlebars.compile(rest_html);
            var htmlToSend = template({op:true});
    
            var mailOptions = {
                from: `${GMAIL}`,
                to: orden.cliente.email,
                subject: 'Confirmación de compra ' + orden._id,
                html: htmlToSend
            };
          
            transporter.sendMail(mailOptions, function(error, info){
                if (!error) {
                    console.log('Email sent: ' + info.response);
                }
            });
        
        });
    } catch (error) {
        console.log(error);
    }
}

const registro_compra_manual_cliente = async function(req,res){
    if(req.user){

        var data = req.body;
        var detalles = data.detalles;

        data.estado = 'Procesando';

        let venta = await Venta.create(data);

        for(var element of detalles){
            element.venta = venta._id;
            element.cliente = venta.cliente;
            await Dventa.create(element);

            let element_producto = await Producto.findById({_id:element.producto});
            let new_stock = element_producto.stock - element.cantidad;
            let new_ventas = element_producto.nventas + 1;

            let element_variedad = await Variedad.findById({_id:element.variedad});
            let new_stock_variedad = element_variedad.stock - element.cantidad;

            await Producto.findByIdAndUpdate({_id: element.producto},{
                stock: new_stock,
                nventas: new_ventas
            });

            await Variedad.findByIdAndUpdate({_id: element.variedad},{
                stock: new_stock_variedad,
            });
        }

        res.status(200).send({venta:venta});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const obtener_pago = async (req, res) => {
    try {
        var id = req.params['id'];
        const result = await mercadopago.payment.findById(id);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la preferencia' });
    }
}

module.exports = {
    login_admin,
    eliminar_etiqueta_admin,
    listar_etiquetas_admin,
    agregar_etiqueta_admin,
    registro_producto_admin,
    listar_productos_admin,
    obtener_producto_admin,
    listar_etiquetas_producto_admin,
    eliminar_etiqueta_producto_admin,
    agregar_etiqueta_producto_admin,
    actualizar_producto_admin,
    listar_variedades_admin,
    actualizar_variedad_admin,
    agregar_nueva_variedad_admin,
    eliminar_variedad_admin,
    listar_inventario_producto_admin,
    registro_inventario_producto_admin,
    agregar_imagen_galeria_admin,
    eliminar_imagen_galeria_admin,
    verificar_token,
    cambiar_vs_producto_admin,
    obtener_config_admin,
    actualizar_config_admin,
    pedido_compra_cliente,
    obtener_ventas_admin,
    obtener_detalles_ordenes_cliente,
    marcar_finalizado_orden,
    eliminar_orden_admin,
    marcar_envio_orden,
    confirmar_pago_orden,
    registro_compra_manual_cliente,
    listar_variedades_productos_admin,
    obtener_pago
}