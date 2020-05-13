import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  @Output() toggleGrapicEvent = new EventEmitter<boolean>();
  mostrarGraficoDeTorta: boolean;
  imgSeleccionada;
  dataCosasFeas: any;
  dataCosasLindas: any;
  listaCosasFeas = [];
  listaCosasLindas = [];
  listaDeImagenes = [];
  listaDeColores = ['lightblue', 'lightcoral', 'lightseagreen', 'magenta', 'midnightblue', 'orange', 'plum', 'royalblue', 'turquoise', 'yellowgreen',
    'red', 'rebeccapurple', 'saddlebrown', 'seashell', 'teal', 'blue']
  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private angularFireStorage: AngularFireStorage) {

  }
  calcularVotacionDeImagen(archivo) {
    let cantVotos = 0;
    archivo.votos.forEach(element => {
      element.voto == 'like' ? cantVotos++ : cantVotos--;
    });
    return cantVotos;
  }
  leerTodasLasVotaciones() {
    this.firestoreService.obtenerTodos('votaciones').subscribe((imagenesSnapShot) => {
      imagenesSnapShot.forEach((response: any) => {
        let imageDate = response.payload.doc.data();
        imageDate['id'] = response.payload.doc.id;
        imageDate['cantVotos'] = this.calcularVotacionDeImagen(imageDate);
        imageDate.imagen.includes('cosasFeas') ? this.listaCosasFeas.push(imageDate) : this.listaCosasLindas.push(imageDate);
      });
      this.chargePieChart();
      this.chargeBarChart();

    });
  }
  toggleGraphic() {
    this.toggleGrapicEvent.emit();
  }
  ngOnInit() {
    this.leerTodasLasVotaciones();
    this.obtenerListaDeImagenes();
  }
  selectData(e: any) {
    let label = this.mostrarGraficoDeTorta ? e.element._view.label : e.element._view.datasetLabel;
    this.listaDeImagenes.forEach((imagen) => {
      if (imagen.imgName == label) {
        this.imgSeleccionada = imagen;
      }
    });
  }
  chargePieChart() {
    let labels = this.listaCosasFeas.map((element) => {
      return element.imagen;
    });
    let data = this.listaCosasFeas.map((element) => {
      return element.cantVotos;
    });
    this.dataCosasFeas = {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: this.listaDeColores,
          hoverBackgroundColor: this.listaDeColores
        }]
    };
  }
  chargeBarChart() {
    let datasets = this.listaCosasLindas.map((element) => {
      let color = this.listaDeColores[Math.floor(Math.random() * (this.listaDeColores.length - 0)) + 0];
      let auxiliar = {
        label: element.imagen,
        backgroundColor: color,
        borderColor: color,
        data: [element.cantVotos]
      }
      return auxiliar;
    });

    this.dataCosasLindas = {
      legend: { display: false },
      labels: ['Votos'],
      datasets: datasets
    }
  }
  obtenerListaDeImagenes() {
    let auxLista = [];
    this.angularFireStorage.storage.ref().listAll().then((lista) => {
      lista.items.forEach(item => {
        item.getDownloadURL().then((link) => {
          let archivo = this.descomponerNombreDeImagen(item.name, link);
          auxLista.push(archivo);
        });
      });
      setTimeout(() => {
        this.listaDeImagenes = auxLista;
      }, 2000);
    });
  }
  descomponerNombreDeImagen(imgName: string, link: string) {
    let datos = imgName.split('_');
    let user = datos[0];
    let date = new Date(parseInt(datos[1]));
    let type = datos[2].split('.')[0];
    let archivo = { 'fecha': date, 'link': link, 'usuario': user, 'tipo': type, 'imgName': imgName }
    return archivo;
  }
  deseleccionarImagen() {
    this.imgSeleccionada = '';
  }
}
