import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { EventService } from 'src/app/services/event.service';
import { GuestService } from 'src/app/services/guest.service';
declare var $:any;
declare var iziToast:any;

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {

  public carrito_arr : Array<any> = [];
  public url = GLOBAL.url;

  public geo : any = {};
  public country = '';
  public currency = 'PEN';
  public token = localStorage.getItem('token')

  public user : any = undefined;
  public user_lc : any = undefined;
  public subtotal:number = 0;

  public precio_envio:number = 0;
  public total_pagar:number = 0;

  constructor(
    private _eventService:EventService,
    private _guestService:GuestService,
    private _router:Router
  ) {
    let lc_geo :any= localStorage.getItem('geo');
    this.geo = JSON.parse(lc_geo);
    this.country = this.geo.country_name;
    this.currency = this.geo.currency;

    if(this.token){
      let obj_lc :any= localStorage.getItem('user_data');
      this.user_lc = JSON.parse(obj_lc);
      this.obtener_carrito();
    }

  }

  ngOnInit(): void {

  }

  calcular_carrito(){
    this.subtotal = 0;
    if(this.user_lc != undefined){
      this.carrito_arr.forEach(element => {
        let sub_precio = element.producto.precio * element.cantidad;
        this.subtotal = this.subtotal + sub_precio;
      });
    }
    this.total_pagar = this.subtotal + (+this.precio_envio);
  }

  obtener_carrito(){
    this._guestService.obtener_carrito_cliente(this.user_lc._id,this.token).subscribe(
      response=>{
        this.carrito_arr = response.data;
        this.calcular_carrito();
      }
    );
  }

  eliminar_item(id:any){
    this.total_pagar  = 0;
    this._guestService.eliminar_carrito_cliente(id,this.token).subscribe(
      response=>{
        iziToast.show({
            title: 'SUCCESS',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Se eliminó el producto correctamente.'
        });
        this.obtener_carrito();
        this._eventService.emitEvent();
      }
    );
  }
}
