import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fecha'
})
export class FechaPipe implements PipeTransform {

  transform(fecha: Date, ...args: any[]): any {
    let day = fecha.getDay().toString();
    let month = fecha.getMonth();
    let year = fecha.getFullYear();
    let hour = fecha.getHours();
    let minute = fecha.getMinutes();
    let second = fecha.getSeconds();
    console.log(day);
    let Fecha = day + '/' + month + '/' + year + ' ' + hour + ':' + minute + ':' + second;
    return Fecha;
  }

}
