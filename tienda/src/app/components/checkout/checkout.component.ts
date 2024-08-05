import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { GuestService } from 'src/app/services/guest.service';
declare var $:any;
declare var iziToast:any;
declare var paypal:any;

interface HtmlInputEvent extends Event{
  target : HTMLInputElement & EventTarget;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, AfterViewChecked {

  @ViewChild('paypalButton',{static:true}) paypalElement : ElementRef;

  public direcciones :Array<any> = [];
  public direcciones_tienda :Array<any> = [];
  public token = localStorage.getItem('token');
  public load_data = false;
  public direccion : any = {
    pais: '',
    region: '',
    provincia: '',
    distrito: '',
    principal: false,
  };

  public geo : any = {};
  public country = '';
  public currency = 'PEN';

  public carrito_arr : Array<any> = [];
  public user_lc : any = undefined;
  public subtotal = 0;
  public envio = 0;
  public total_pagar = 0;
  public cupon_id = undefined

  public direccion_envio : any = undefined;
  public metodo_pago = undefined;
  public btn_load = false;

  /***************************** */

  public venta : any = {};
  public dventa : Array<any> = [];
  public nota = '';
  public tipo_descuento = undefined;
  public valor_descuento = 0;

   /***************************** */

   public total_pagar_const = 0;
   public envio_gratis= false;
   public configurado: boolean = true;

  constructor(
    private _guestService:GuestService,
    private _router:Router
  ) {

    let obj_lc :any= localStorage.getItem('user_data');
    this.user_lc = JSON.parse(obj_lc);
    let lc_geo :any= localStorage.getItem('geo');
    this.geo = JSON.parse(lc_geo);
    this.country = this.geo.country_name;
    this.currency = this.geo.currency;

  }
  ngAfterViewChecked(): void {
    // if(this.configurado){
    //   setTimeout(()=> {
    //     let shipping_3: HTMLInputElement = document.querySelector('#shipping-3') as HTMLInputElement
    //     let shipping_2: HTMLInputElement = document.querySelector('#shipping-2') as HTMLInputElement
    //     let shipping_1: HTMLInputElement = document.querySelector('#shipping-1') as HTMLInputElement
    //     shipping_1.before()
    //     shipping_2.before()
    //     shipping_3.before()
    //   })
    //   this.configurado = false
    // }
  }

  ngOnInit(): void {
    this.obtener_direcciones();
    this.obtener_direcciones_tienda();
    this.obtener_carrito();
  }

  obtener_direcciones(){
    this._guestService.obtener_direccion_todos_cliente(localStorage.getItem('_id'),this.token).subscribe(
      response=>{
        this.direcciones = response.data;
        this.load_data = false;
      }
    );
  }

  obtener_direcciones_tienda(){
    this._guestService.obtener_direccion_tienda_cliente(this.token).subscribe(
      response=>{
        this.direcciones_tienda = response.data;
      }
    );
  }

  obtener_carrito(){
    this._guestService.obtener_carrito_cliente(this.user_lc._id,this.token).subscribe(
      response=>{
        this.carrito_arr = response.data;
        this.carrito_arr.forEach(element => {
          this.dventa.push({
            producto: element.producto._id,
            subtotal: element.producto.precio,
            variedad: element.variedad._id,
            cantidad: element.cantidad,
            cliente: localStorage.getItem('_id')
          });
        });
        this.calcular_carrito();
      }
    );
  }

  calcular_carrito(){
    this.subtotal = 0;
    if(this.user_lc != undefined){
      this.carrito_arr.forEach(element => {
        let sub_precio = element.producto.precio * element.cantidad;
        this.subtotal = this.subtotal + sub_precio;
      });
    }
    this.total_pagar = this.subtotal;
    this.total_pagar_const = this.subtotal;
  }

  select_envio_gratis(item:any){
    this.envio_gratis = true;
    this.direccion_envio = item;
    this.envio = 0;

    if(this.venta.cupon != undefined){
      this.total_pagar = (this.total_pagar_const - this.valor_descuento) + this.envio;
    }else{
      this.total_pagar = this.total_pagar_const + this.envio;
    }

    iziToast.show({
      title: 'SUCCESS',
      titleColor: '#1DC74C',
      color: '#FFF',
      class: 'text-success',
      position: 'topRight',
      message: 'Se establecio la direccion.'
    });
  }

  select_direccion_envio(item:any){
    this.envio_gratis = false;
    this.direccion_envio = item;
    this.envio = 10;

    if(this.venta.cupon != undefined){
      this.total_pagar = (this.total_pagar_const - this.valor_descuento) + this.envio;
    }else{
      this.total_pagar = this.total_pagar_const + this.envio;
    }

    iziToast.show({
      title: 'SUCCESS',
      titleColor: '#1DC74C',
      color: '#FFF',
      class: 'text-success',
      position: 'topRight',
      message: 'Se establecio la direccion.'
    });

  }

  get_token_culqi(){

    if(this.direccion_envio === undefined){
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Selecciona una direccion'
      });
      return
    }

    if(this.carrito_arr.length === 0){
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'El carrito esta vacio'
      });
      return
    }

    this._guestService.comprobar_carrito_cliente({detalles:this.dventa},this.token).subscribe(
      response=>{
        if(response.venta){
          let items = [];

          this.carrito_arr.forEach(element => {
            items.push({
              title: element.producto.titulo,
              description: element.producto.descripcion,
              quantity: element.cantidad,
              currency_id: 'PEN',
              unit_price: element.producto.precio
            });
          });

          items.push({
            title: 'Envio',
            description: 'Concepto de transporte y logistica',
            quantity: 1,
            currency_id: 'PEN',
            unit_price: this.envio
          });

          if(this.venta.cupon){
            items.push({
              title: 'Descuento',
              description: 'Cupón aplicado ' + this.venta.cupon,
              quantity: 1,
              currency_id: 'PEN',
              unit_price: - (this.valor_descuento)
            });
          }

          let data = {
            notification_url: `${GLOBAL.webhook}?cliente_id=${this.user_lc._id}&direccion_id=${this.direccion_envio._id}&cupon_id=${this.cupon_id}&precio_envio=${this.envio}&subtotal=${this.subtotal}`,
            items: items,
            back_urls: {
                failure: `${GLOBAL.host}/verificar-pago/failure/`,
                pending: `${GLOBAL.host}/verificar-pago/pending/`,
                success: `${GLOBAL.host}/verificar-pago/success/`,
            },
            auto_return: "approved"
          }

          console.log(data)
          this._guestService.create_token(data).subscribe(
            response=>{
              window.location.href =response.init_point;

            }
          );
        }else{
          iziToast.show({
              title: 'ERROR',
              titleColor: '#FF0000',
              color: '#FFF',
              class: 'text-danger',
              position: 'topRight',
              message: response.message
          });
          this.btn_load = false;
        }
      }
    );
  }

  generar_pedido(tipo:any){

    if(this.direccion_envio === undefined){
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Selecciona una direccion'
      });
      return
    }

    if(this.carrito_arr.length === 0){
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'El carrito esta vacio'
      });
      return
    }

    this.venta.transaccion = 'Venta pedido';
    this.venta.currency = 'PEN';
    this.venta.subtotal = this.subtotal;
    this.venta.total_pagar = this.total_pagar;
    this.venta.envio_precio = this.envio;
    this.venta.detalles = this.dventa;
    this.venta.metodo_pago = this.metodo_pago;
    this.venta.nota = this.nota;
    this.venta.direccion = this.direccion_envio._id;
    this.venta.tipo_descuento = this.tipo_descuento;
    this.venta.valor_descuento = this.valor_descuento;
    let idcliente = localStorage.getItem('_id');
    this.venta.cliente = idcliente;

    this.btn_load = true;
    this._guestService.pedido_compra_cliente(this.venta,this.token).subscribe(
      response=>{

        if(response.venta != undefined){
          this.btn_load = false;
          this._router.navigate(['/cuenta/pedidos',response.venta._id]);
        }else{
          iziToast.show({
              title: 'ERROR',
              titleColor: '#FF0000',
              color: '#FFF',
              class: 'text-danger',
              position: 'topRight',
              message: response.message
          });
          this.btn_load = false;
        }
      }
    );
  }


  validar_cupon(){

    if(this.venta.cupon){
      if(this.venta.cupon.toString().length <= 25){

        this._guestService.validar_cupon_admin(this.venta.cupon,this.token).subscribe(
          response=>{

            if(response.data != undefined){
              this.tipo_descuento =  response.data.tipo;
              this.cupon_id = response.data._id;

              if(response.data.disponibilidad == 'Exterior'){
                if(this.currency != 'PEN'){
                  if(response.data.tipo == 'Valor fijo'){
                    this.valor_descuento = response.data.valor;
                    this.total_pagar = (this.total_pagar_const - this.valor_descuento) + this.envio;
                  }else if(response.data.tipo == 'Porcentaje'){
                    this.valor_descuento = Math.round((this.total_pagar_const * response.data.valor)/100);
                    this.total_pagar = (this.total_pagar_const - this.valor_descuento) + this.envio;
                  }
                  this.select_direccion_envio(this.direccion_envio);
                }else{
                  iziToast.show({
                      title: 'ERROR',
                      titleColor: '#ff0000',
                      color: '#FFF',
                      class: 'text-success',
                      position: 'topRight',
                      message: 'El cupón no es valido para tu país'
                  });
                }
              }else if(response.data.disponibilidad == 'Peru'){
                if(this.currency == 'PEN'){
                  if(response.data.tipo == 'Valor fijo'){
                    this.valor_descuento = response.data.valor;
                    this.total_pagar = (this.total_pagar_const - this.valor_descuento) + this.envio;
                  }else if(response.data.tipo == 'Porcentaje'){
                    this.valor_descuento = Math.round((this.total_pagar_const * response.data.valor)/100);
                    this.total_pagar = (this.total_pagar_const - this.valor_descuento) + this.envio;
                  }
                  this.select_direccion_envio(this.direccion_envio);
                }else{
                  iziToast.show({
                      title: 'ERROR',
                      titleColor: '#ff0000',
                      color: '#FFF',
                      class: 'text-success',
                      position: 'topRight',
                      message: 'El cupón no es valido para tu país'
                  });
                }
              }

            }else{
              iziToast.show({
                  title: 'ERROR',
                  titleColor: '#ff0000',
                  color: '#FFF',
                  class: 'text-success',
                  position: 'topRight',
                  message: response.message
              });
            }
          }
        );
      }else{
        iziToast.show({
            title: 'ERROR',
            titleColor: '#ff0000',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'El cupon debe ser menos de 25 caracteres.'
        });
      }
    }else{
      iziToast.show({
          title: 'ERROR',
          titleColor: '#ff0000',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'El cupon no es valido.'
      });

    }
  }


}
