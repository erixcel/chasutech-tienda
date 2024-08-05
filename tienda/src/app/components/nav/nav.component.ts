import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { EventService } from 'src/app/services/event.service';
import { GuestService } from 'src/app/services/guest.service';

declare var $:any;
declare var iziToast:any;
declare function stickyHeader():any;


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  public geo : any = {};
  public country = '';
  public currency = 'PEN';
  public token = localStorage.getItem('token')

  public categorias :Array<any> = [];
  public user_lc : any = undefined;

  public carrito_arr : Array<any> = [];
  public url = GLOBAL.url;
  public subtotal = 0;
  public filtro_search = ''
  public config: any = {};

  constructor(
    private _eventService:EventService,
    private _guestService:GuestService,
    private _router:Router
  ) {

    setTimeout(() => {
      stickyHeader();
    }, 50);

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

    this._eventService.getEvent().subscribe(() => {
      this.obtener_carrito()
    });

    this._guestService.obtener_config_admin().subscribe(
      response=>{
        this.config = response.data;
      }
    );

    this._guestService.get_categorias().subscribe(
      response=>{
        this.categorias = response;

      }
    );
  }

  search(){
    if(this.filtro_search){
      this._router.navigate(['/productos/'], { queryParams: { filter: this.filtro_search } });
    }
  }

  openCart(){
    var clase = $('#modalCarrito').attr('class');
    if(clase == 'ps-panel--sidebar'){
      $('#modalCarrito').addClass('active');
    }else if(clase == 'ps-panel--sidebar active'){
      $('#modalCarrito').removeClass('active');
    }
  }

  openMenu(){
    var clase = $('#modalMenu').attr('class');
    if(clase == 'ps-panel--sidebar'){
      $('#modalMenu').addClass('active');
    }else if(clase == 'ps-panel--sidebar active'){
      $('#modalMenu').removeClass('active');
    }
  }

  calcular_carrito(){
    this.subtotal = 0;
    if(this.user_lc != undefined){
      this.carrito_arr.forEach(element => {
        let sub_precio = element.producto.precio * element.cantidad;
        this.subtotal = this.subtotal + sub_precio;
      });
    }
  }

  logout(){
    window.location.reload();
    localStorage.removeItem('token');
    localStorage.removeItem('_id');
    localStorage.removeItem('user_data');
    this._router.navigate(['/']).then(() => {
      window.location.reload();
    });;
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
      }
    );
  }
}
