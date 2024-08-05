import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GuestService } from 'src/app/services/guest.service';

@Component({
  selector: 'app-verify-pago',
  templateUrl: './verify-pago.component.html',
  styleUrls: ['./verify-pago.component.css']
})
export class VerifyPagoComponent implements OnInit {

  public tipo = '';
  public load = true;
  public payment_id = '';
  public token :any  = '';

  constructor(
    private _route:ActivatedRoute,
    private _guestService:GuestService,
    private _router:Router
  ) {
    this.token = localStorage.getItem('token');
   }

  ngOnInit(): void {
    this._route.params.subscribe(
      params=>{
        this.tipo = params['tipo'];
        if(this.tipo == 'success'){
          this._route.queryParams.subscribe(
            (params: Params)=>{
              this.payment_id = params.payment_id;
              this._guestService.obtener_orden_cliente(this.payment_id,this.token).subscribe(response => {
                this._router.navigate(['/cuenta/pedidos',response.data._id]);
              })
            }
          )
        }else{
          this.load = false;
        }
      }
    );
  }

}
