import {ChangeDetectionStrategy, Component, EventEmitter} from '@angular/core';
import {interval, Observable,of} from 'rxjs';
import {map, startWith, takeUntil,finalize, takeWhile,switchMap, mapTo } from 'rxjs/operators';
// import { AnyARecord } from 'dns';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  public readonly data$: Observable<{
    counter: number,
  }>;
 
  public readonly start$: EventEmitter<void> = new EventEmitter();
  public readonly stop$: EventEmitter<void> = new EventEmitter();
  countCompleted = false;
   start=false;
  constructor() {
    this.data$ = interval(3000).pipe(
      // Put your code here. Feel free to change the lines below too.
     
      startWith(0),
      map(counter =>this.checkEvent(this.start$,this.stop$)? counter + 1:0),
     map(counter=>({counter}) )
           
    )
  }

  public  checkEvent(emitter:EventEmitter<void>,emitter2:EventEmitter<void>):boolean
  {
    
      emitter.subscribe({
        next: (event: EventEmitter<void>) => {
                this.start=true;
            
                this.data$.subscribe(p=>
                  {
                  //  alert(p.counter);
                    // p.counter=0;
                  })
      }
      });
      emitter2.subscribe(
        {
         
        next: (event: EventEmitter<void>) => {
            this.start=false;
            
            this.data$.subscribe().unsubscribe();
      }

      })
    return this.start;
  }

  
}
