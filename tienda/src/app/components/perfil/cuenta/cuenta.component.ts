import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GuestService } from 'src/app/services/guest.service';
declare var $:any;
declare var iziToast:any;

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.component.html',
  styleUrls: ['./cuenta.component.css']
})
export class CuentaComponent implements OnInit {

  public cliente : any = {};
  public id :any = '';
  public token :any = '';
  public show_password: boolean = false

  constructor(
    private _guestService:GuestService,
    private _router:Router
  ) {
    this.id = localStorage.getItem('_id');
    this.token = localStorage.getItem('token');

    if(this.id){
      this._guestService.obtener_cliente_guest(this.id,this.token).subscribe(
        response=>{
          this.cliente = response.data;
        }
      );
    }
  }

  ngOnInit(): void {
  }

  actualizar(actualizarForm:any){
    let mensaje_error:string = 'Los datos del formulario no son validos';
    let valid:boolean = true
    if(!actualizarForm.valid) valid = false
    else if((this.cliente.telefono+"").length !== 9) {mensaje_error = 'Telefono | (9 digitos)'; valid = false}
    else if((this.cliente.dni+"").length !== 8) {mensaje_error = 'DNI | (8 digitos)'; valid = false}

    if(valid) {
      this.cliente.password = $('#input_password').val();
      this._guestService.actualizar_perfil_cliente_guest(this.id,this.cliente,this.token).subscribe(
        response=>{
          iziToast.show({
              title: 'SUCCESS',
              titleColor: '#1DC74C',
              color: '#FFF',
              class: 'text-success',
              position: 'topRight',
              message: 'Se actualizo su perfil correctamente.'
          });

        }
      );
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: `${mensaje_error}`
    });
    }
  }

}
