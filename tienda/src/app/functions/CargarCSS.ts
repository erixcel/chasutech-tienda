export class CargarCSS {
    constructor(){}

    Carga( archivos:string[])
    {
      for(let archivo of archivos){
        let style = document.createElement("link")
        style.href = "./assets/css/" + archivo + ".css"
        style.rel="stylesheet"
        let body = document.getElementsByTagName("head")[0]
        body.appendChild(style)
      }
    }
  }
