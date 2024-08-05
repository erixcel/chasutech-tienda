import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/service/admin.service';

@Component({
  selector: 'app-index-clientes',
  templateUrl: './index-clientes.component.html',
  styleUrls: ['./index-clientes.component.css']
})
export class IndexClientesComponent implements OnInit {

  public clientes :Array<any>= [];
  public clientes_const  :Array<any>= [];
  public token = localStorage.getItem('token');
  public page = 1;
  public pageSize = 24;
  public filtro = '';
  public opcionFiltro = 'Nombres';
  constructor(
    private _adminService:AdminService
  ) { }

  ngOnInit(): void {
    this._adminService.listar_clientes_tienda(this.token).subscribe(
      response=>{
        this.clientes_const = response.data;
        this.clientes= this.clientes_const;
      }
    );
  }

  filtrar_cliente(){
    if(this.filtro){
      var term = new RegExp(this.filtro.toString().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), 'i');
      switch (this.opcionFiltro) {
        case 'Nombres':
          this.clientes = this.clientes_const.filter(item=>term.test(item.nombres.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
          break;
        case 'Apellidos':
          this.clientes = this.clientes_const.filter(item=>term.test(item.apellidos.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
          break;
        case 'DNI':
          this.clientes = this.clientes_const.filter(item=>term.test(item.dni?.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
          break;
        case 'Telefono':
          this.clientes = this.clientes_const.filter(item=>term.test(item.telefono?.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
          break;
        case 'Correo':
          this.clientes = this.clientes_const.filter(item=>term.test(item.email.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
          break;
        default:
          this.clientes = this.clientes_const.filter(item=>term.test(item._id.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
      }
    }else{
      this.clientes = this.clientes_const;
    }
  }

}
