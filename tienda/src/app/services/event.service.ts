// event.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private eventSubject = new Subject<any>();

  emitEvent() {
    this.eventSubject.next();
  }

  getEvent() {
    return this.eventSubject.asObservable();
  }
}
