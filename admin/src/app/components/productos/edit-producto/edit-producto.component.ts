import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { compressImageToFile } from 'src/app/functions/FunctionsImage';
import { AdminService } from 'src/app/service/admin.service';
import { GLOBAL } from 'src/app/service/GLOBAL';
declare var iziToast:any;
declare var $:any;


@Component({
  selector: 'app-edit-producto',
  templateUrl: './edit-producto.component.html',
  styleUrls: ['./edit-producto.component.css']
})
export class EditProductoComponent implements OnInit {

  public id = '';
  public load_data = false;
  public producto: any = {
    categoria: '',
    estrellas: 0,
    visibilidad: '',
  };
  public imgSelect : any | ArrayBuffer = 'assets/img/01.jpg';
  public categorias: Array<any> = [];
  public config : any = {};
  public load_btn = false;
  public file : any = undefined;


  public arr_etiquetas: Array<any> = [];
  public token = localStorage.getItem('token');
  public new_etiqueta = '';
  public load_data_etiqueta = false;
  public etiquetas : Array<any> = [];
  public load_etiquetas = false;
  public url = GLOBAL.url;

  constructor(
    private _adminService:AdminService,
    private _router:Router,
    private _route : ActivatedRoute,
  ) {
    this.config = {
      height: 500
    }
  }

  ngOnInit(): void {
    this._adminService.get_categorias().subscribe(
      response=>{
        this.categorias = response;
      }
    );

    this._route.params.subscribe(
      params=>{
        this.id = params['id'];
        this.load_data = true;
        this._adminService.obtener_producto_admin(this.id,this.token).subscribe(
          response=>{
           if(response.data == undefined){
            this.load_data = false;
            this.producto = undefined;

           }else{
             this.load_data = false;
             this.producto = response.data;
             this.listar_etiquetas();
             this.listar_etiquetas_producto();
             this.imgSelect = this.producto.portada;
           }

          },
          error=>{
            console.log(error);

          }
        );

      }
    );
  }

  listar_etiquetas(){
    this.load_data_etiqueta = true;
    this._adminService.listar_etiquetas_admin(this.token).subscribe(
      response=>{
        this.etiquetas = response.data;
        this.load_data_etiqueta = false;
      }
    );
  }

  listar_etiquetas_producto(){
    this.load_etiquetas = true;
    this._adminService.listar_etiquetas_producto_admin(this.id,this.token).subscribe(
      response=>{
        this.arr_etiquetas = response.data;
        this.load_etiquetas = false;
      }
    );
  }


  fileChangeEvent(event:any):void{
    var file : any;
    if(event.target.files && event.target.files[0]){
      file = <File>event.target.files[0];
      compressImageToFile(file,"auto").then(data => {
        this.file = data[0];
        this.imgSelect = data[1];
      })
    } else{
      iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'No hay un imagen de envio'
      });
    }
  }

  eliminar_etiqueta(id:any){
    this.load_etiquetas = true;
    this._adminService.eliminar_etiqueta_producto_admin(id,this.token).subscribe(
      response=>{
        this.listar_etiquetas_producto();
        this.load_etiquetas = false;
      }
    );
  }

  agregar_etiqueta(){

    let data = {
      etiqueta: this.new_etiqueta,
      producto: this.id
    }
    this.load_etiquetas = true;
    this._adminService.agregar_etiqueta_producto_admin(data,this.token).subscribe(
      response=>{
        this.listar_etiquetas_producto();
        this.load_etiquetas = false;
      }
    );
  }

  actualizar(actualizarForm:any){
    if(actualizarForm.valid){

      var data : any= {};

      if(this.file != undefined){
        data.portada = this.file;
      }

      if(!this.producto.precio_antes || this.producto.precio_antes == undefined){
        this.producto.precio_antes = 0;
      }

      data.titulo = this.producto.titulo;
      data.stock = this.producto.stock;
      data.precio_antes = this.producto.precio_antes;
      data.precio = this.producto.precio;
      data.peso = this.producto.peso;
      data.sku = this.producto.sku;
      data.estrellas = this.producto.estrellas;
      data.categoria = this.producto.categoria;
      data.descripcion = new DOMParser().parseFromString(this.producto.contenido, 'text/html').body.textContent || ""
      data.contenido = this.producto.contenido;
      data.visibilidad = this.producto.visibilidad;

      this.load_btn = true;
      this._adminService.actualizar_producto_admin(data,this.id,this.token).subscribe(
        response=>{
          iziToast.show({
              title: 'SUCCESS',
              titleColor: '#1DC74C',
              color: '#FFF',
              class: 'text-success',
              position: 'topRight',
              message: 'Se actualizó correctamente el nuevo producto.'
          });

          this.load_btn = false;

          this._router.navigate(['/productos']);
        },
        error=>{
          this.load_btn = false;
        }
      )

    }else{
      iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Los datos del formulario no son validos'
      });
      this.load_btn = false;
    }
}

}
