import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { GuestService } from 'src/app/services/guest.service';
declare var Slick:any;
declare var lightGallery:any;
declare var iziToast:any;
import { GLOBAL } from 'src/app/services/GLOBAL';
import { EventService } from 'src/app/services/event.service';
declare var $:any;
declare function productLightbox():any;
declare function slickConfig():any;

@Component({
  selector: 'app-show-producto',
  templateUrl: './show-producto.component.html',
  styleUrls: ['./show-producto.component.css']
})
export class ShowProductoComponent implements OnInit {

  //GEO
  public geo : any = {};
  public country = '';
  public currency = 'PEN';
  public user_lc : any = undefined;
  public token :any = '';

  public data = false;
  public load_producto = true;
  public producto : any = {};
  public url = GLOBAL.url;
  public reviews :Array<any> = [];

  public select_variedad_lbl = '';
  public obj_variedad_select : any= {
    id: '',
    stock: 0,
    valor: '',
  }
  public variedades :Array<any> = [];
  public carrito_data : any = {
    variedad: '',
    cantidad: 0
  };
  public btn_cart = false;

  public page = 1;
  public pageSize = 15;
  public productos_rec : Array<any> = [];
  public slug = '';

  public categoria_producto : any= {};
  public option_nav = 1;

  constructor(
    private _eventService:EventService,
    private _guestService:GuestService,
    private _route:ActivatedRoute
  ) {
    let obj_lc :any= localStorage.getItem('user_data');
    this.user_lc = JSON.parse(obj_lc);

    this.token = localStorage.getItem('token');
    this.url = GLOBAL.url;

    let lc_geo :any= localStorage.getItem('geo');
    this.geo = JSON.parse(lc_geo);
    this.country = this.geo.country_name;
    this.currency = this.geo.currency;

  }

  ngOnInit(): void {

    this._route.params.subscribe(
      params=>{
        this.slug = params['slug'];
        this.load_producto = true;
        this._guestService.obtener_productos_slug_publico(this.slug).subscribe(
          response=>{

            if(response.data != undefined){
              this.producto = response.data;
              this.init_productos_recomendados();
              this._guestService.get_categorias().subscribe(
                response=>{
                  for(var item of response){
                    if(item._id == this.producto.categoria){
                      this.categoria_producto = item;
                    }
                  }
                }
              );


              setTimeout(() => {
                productLightbox();
                slickConfig();
              }, 100);

              this._guestService.obtener_reviews_producto_publico(this.producto._id).subscribe(
                response=>{
                  this.reviews = response.data;
                }
              );
              this.init_variedades();
              this.data = true;
              this.load_producto = false;
            }else{
              this.data = false;
              this.load_producto = false;
            }

          }
        );

      }
    );
  }

  init_variedades(){
    this._guestService.obtener_variedades_productos_cliente(this.producto._id).subscribe(
      response=>{
        this.variedades = response.data;
        if(this.variedades.length){
          for(let i = 0; i < this.variedades.length; i++){
            if(this.variedades[i].stock){
              this.select_variedad_lbl=`${this.variedades[i]._id}_${this.variedades[i].valor}_${this.variedades[i].stock}`
              this.select_variedad()
              break;
            }

          }
        }
      }
    );
  }

  select_variedad(){
    let arr_variedad = this.select_variedad_lbl.split('_');
    this.obj_variedad_select.id = arr_variedad[0];
    this.obj_variedad_select.valor = arr_variedad[1];
    this.obj_variedad_select.stock = arr_variedad[2];
  }

  SumCant(){
    this.carrito_data.cantidad = this.carrito_data.cantidad + 1;
  }

  RestCant(){
    if(this.carrito_data.cantidad >= 1){
      this.carrito_data.cantidad = this.carrito_data.cantidad - 1;
    }
  }

  init_productos_recomendados(){
    this._guestService.listar_productos_recomendados_publico(this.producto.categoria).subscribe(
      response=>{
        this.productos_rec = response.data;
      }
    );
  }

  agregar_producto(){
    if(this.user_lc != null && this.token){
      if(this.obj_variedad_select.valor){
        if(this.carrito_data.cantidad >= 1){
          if(this.carrito_data.cantidad <= this.obj_variedad_select.stock){
            let data = {
              producto: this.producto._id,
              cliente: localStorage.getItem('_id'),
              cantidad: this.carrito_data.cantidad,
              variedad: this.obj_variedad_select.id,
            }
            this.btn_cart = true;
            console.log(data)
            this._guestService.agregar_carrito_cliente(data,this.token).subscribe(
              response=>{
                if(response.data == undefined){
                  iziToast.show({
                      title: 'ERROR',
                      titleColor: '#FF0000',
                      color: '#FFF',
                      class: 'text-danger',
                      position: 'topRight',
                      message: response.message
                  });
                  this.btn_cart =false;
                }else{

                  iziToast.show({
                      title: 'SUCCESS',
                      titleColor: '#1DC74C',
                      color: '#FFF',
                      class: 'text-success',
                      position: 'topRight',
                      message: 'Se agregó el producto al carrito.'
                  });
                  this.btn_cart =false;
                  this._eventService.emitEvent();
                }
              }, error => {
                console.log(error)
              }
            );
          }else{
            iziToast.show({
                title: 'ERROR',
                titleColor: '#FF0000',
                color: '#FFF',
                class: 'text-danger',
                position: 'topRight',
                message: 'La cantidad máxima del producto es.' + this.obj_variedad_select.stock
            });
          }
        }else{
          iziToast.show({
            title: 'ERROR',
            titleColor: '#FF0000',
            color: '#FFF',
            class: 'text-danger',
            position: 'topRight',
            message: 'Ingrese una cantidad válida por favor.'
          });
        }
      }else{
        iziToast.show({
            title: 'ERROR',
            titleColor: '#FF0000',
            color: '#FFF',
            class: 'text-danger',
            position: 'topRight',
            message: 'Seleccione una variedad de producto'
        });
      }
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Inicia sesion antes'
    });
    }

  }

  change_option(op:any){
    this.option_nav = op;
  }

  enviarMensaje() {
    let nombreCompleto = this.user_lc === null ? '' : 'soy ' + this.user_lc.nombres + ' ' + this.user_lc.apellidos
    let mensaje = `Hola ${nombreCompleto}, me gustaria comprar por mayor el producto "${this.producto.titulo}" de la tienda ChasuTech, podrian proporcionarme los precios por favor. Gracias`;
    let numeroWhatsApp = '929073820';
    let url = 'https://wa.me/' + numeroWhatsApp + '?text=' + encodeURIComponent(mensaje);
    window.open(url, '_blank');
  }
}
