import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GuestService } from 'src/app/services/guest.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {

  verifiy_email: number = 0
  token: string = "";

  constructor(
    private _route:ActivatedRoute,
    private _guestService:GuestService,
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe(
      params=>{
        this.token = params['token'];
        if(this.token) {
          this._guestService.registro_cliente_tienda(this.token).subscribe(response => {
            if(response.data != undefined){
              this.verifiy_email = 1;
            } else {
              this.verifiy_email = 2;
            }
          })
        }
      }
    )
  }

}
