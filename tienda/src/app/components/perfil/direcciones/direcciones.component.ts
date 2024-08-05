import { Component, OnInit } from '@angular/core';
import { CargarCSS } from 'src/app/functions/CargarCSS';
import { CargarJS } from 'src/app/functions/CargarJS';
import { GuestService } from 'src/app/services/guest.service';
declare var iziToast:any;
declare var $:any;

declare function enviarSMS(phone: string): string;
declare function verificarSMS(phone: string): string;

@Component({
  selector: 'app-direcciones',
  templateUrl: './direcciones.component.html',
  styleUrls: ['./direcciones.component.css']
})
export class DireccionesComponent implements OnInit {

  public geo : any = {};
  public country = '';
  public currency = 'PEN';

  public token = localStorage.getItem('token');
  public direccion : any = {
    pais: 'Perú',
    departamento: '',
    provincia: '',
    distrito: '',
    principal: false,
  };

  public str_pais = '';

  public direcciones :Array<any> = [];

  public departamentos:Array<any> = [];
  public provincias:Array<any> = [];
  public distritos:Array<any> = [];

  public departamentos_arr:Array<any> = [];
  public provincias_arr:Array<any> = [];
  public distritos_arr:Array<any> = [];

  public sms_status = false;
  public cod_verificador:number;
  public load_data = true;
  public op = 1;

  constructor(
    private cargarJS:CargarJS,
    private cargarCSS:CargarCSS,
    private _guestService:GuestService
  ) {
    cargarJS.Carga(["direcciones"])
    cargarCSS.Carga(["direcciones"])

    let lc_geo :any= localStorage.getItem('geo');
    this.geo = JSON.parse(lc_geo);
    this.country = this.geo.country_name;
    this.currency = this.geo.currency;

    this._guestService.get_Departamentos().subscribe(
      response=>{
        this.departamentos_arr = response;
      }
    );

    this._guestService.get_Procincias().subscribe(
      response=>{
        this.provincias_arr = response;
      }
    );

    this._guestService.get_Distritos().subscribe(
      response=>{
        this.distritos_arr = response;
      }
    );
  }

  ngOnInit(): void {
    this.obtener_direccion();
    setTimeout(() => {
      $('#sl-departamento').prop('disabled', false);
    });
    this._guestService.get_Departamentos().subscribe(
      response=>{
        response.forEach((element:any) => {
          this.departamentos.push({
            id: element.id,
            name: element.name
          });
        });

      }
    );
  }

  registrar(){
    this.departamentos_arr.forEach(element => {
      if(parseInt(element.id) == parseInt(this.direccion.departamento)){
        this.direccion.departamento = element.name;
      }
    });

    this.provincias_arr.forEach(element => {
      if(parseInt(element.id) == parseInt(this.direccion.provincia)){
        this.direccion.provincia = element.name;
      }
    });

    this.distritos_arr.forEach(element => {
      if(parseInt(element.id) == parseInt(this.direccion.distrito)){
        this.direccion.distrito = element.name;
      }
    });

    let data = {
      nombres: this.direccion.nombres,
      apellidos: this.direccion.apellidos,
      dni: this.direccion.dni,
      zip: this.direccion.zip,
      direccion: this.direccion.direccion,
      referencia: this.direccion.referencia,
      telefono: this.direccion.telefono,
      pais: this.direccion.pais,
      departamento: this.direccion.departamento,
      provincia: this.direccion.provincia,
      distrito: this.direccion.distrito,
      principal: this.direccion.principal,
      cliente: localStorage.getItem('_id')
    }

    this._guestService.registro_direccion_cliente(data,this.token).subscribe(
      response=>{
        this.direccion = {
          nombres: '',
          apellidos: '',
          dni: '',
          zip: '',
          direccion: '',
          referencia: '',
          telefono: '',
          pais: 'Perú',
          departamento: '',
          provincia: '',
          distrito: '',
          principal: false,
        };
        $('#sl-provincia').prop('disabled', true);
        $('#sl-distrito').prop('disabled', true);
        this.obtener_direccion();
        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Correcto, direccion creada!'
        });
      }
    );
  }

  select_departamento(){
    this.provincias = [];
    setTimeout(() => {
      $('#sl-provincia').prop('disabled', false);
      $('#sl-distrito').prop('disabled', true);
    }, 50);
    this.direccion.provincia = '';
    this.direccion.distrito = '';
    this._guestService.get_Procincias().subscribe(
      response=>{
        response.forEach((element:any) => {
            if(element.department_id == this.direccion.departamento){
              this.provincias.push(
                element
              );
            }
        });


      }
    );
  }

  select_provincia(){
    this.distritos = [];
    setTimeout(() => {
      $('#sl-distrito').prop('disabled', false);
    }, 50);
    this.direccion.distrito= '';
    this._guestService.get_Distritos().subscribe(
      response=>{
        response.forEach((element:any) => {
          if(element.province_id == this.direccion.provincia){
            this.distritos.push(
              element
            );
          }
      });

      }
    );
  }

  obtener_direccion(){
    this._guestService.obtener_direccion_todos_cliente(localStorage.getItem('_id'),this.token).subscribe(
      response=>{
        this.direcciones = response.data;
        this.load_data = false;
      }
    );
  }

  eliminar(id:any){
    this._guestService.eliminar_direccion_cliente(id,this.token).subscribe(
      response=>{
        iziToast.show({
            title: 'SUCCESS',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Se eliminó la dirección correctamente.'
        });
        this.obtener_direccion();

      },
      error=>{
        console.log(error);

      }
    )
  }

  async enviarSMS(registroForm:any,telefono:string){
    if(registroForm.valid){
      let mensajeError = "Hubo un error al enviar el SMS"
      if((this.direccion.dni+"").length !== 8) mensajeError = "DNI | 8 digitos"
      else {
        let response = await enviarSMS(`+51${telefono}`)
        if(response === "success"){
          this.sms_status = true;
          iziToast.show({
            title: 'REVISA',
            titleColor: '#FFC107',
            color: '#FFF',
            class: 'text-warning',
            position: 'topRight',
            message: 'Se te envio un SMS a tu celular'
          });
          return
        }
        if(response === "invalid-number") mensajeError = "Numero invalido"
        if(response === "many-requests") mensajeError = "Excediste el límite de SMS a este número"
      }
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: `${mensajeError}`
      });
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Los datos del formulario no son validos'
      });
    }

  }

  async verificarSMS(codigo:string){
    let response = await verificarSMS(codigo)
    if(response === "success"){
      this.sms_status = false
      this.registrar()
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Codigo incorrecto'
      });
    }
  }

  changeOp(op:any){
    this.op = op;
  }
}
