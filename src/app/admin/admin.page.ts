import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AngularFireStorage } from '@angular/fire/storage';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/services/firestore.service';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})


export class AdminPage implements OnInit {
  showChart = false;
  mostrarImagenesPropias = false;
  @Input() imgSeleccionada;
  listaDeVotaciones = [];
  showFullImg: boolean = false;
  spinner = false;
  currentUser: any = { "galery": "cosasLindas" };
  imagen: string;
  listaDeImagenes: any = [];
  listaDeImagenesPropias: any = [];
  listaFiltrada: any = [];
  pathDeImagen: any;
  storageRef = this.angularFireStorage.storage.ref();
  nombreDeImagen;
  constructor(private authService: AuthService,
    private camera: Camera,
    private angularFireStorage: AngularFireStorage,
    private toast: ToastController,
    private router: Router,
    private firestoreService: FirestoreService
  ) {

  }

  ngOnInit() {
    //
    this.currentUser = this.authService.currentUser;
    this.leerTodasLasVotaciones();
    this.obtenerListaDeImagenes();
  }
  deseleccionarImagen() {
    this.imgSeleccionada = "";
  }
  leerTodasLasVotaciones() {
    this.firestoreService.obtenerTodos('votaciones').subscribe((imagenesSnapShot) => {
      imagenesSnapShot.forEach((response: any) => {
        let imageDate = response.payload.doc.data();
        imageDate['id'] = response.payload.doc.id;
        this.listaDeVotaciones.push(imageDate);
      });
    })
  }

  agregarVotacion(imagen: any, calificacion) { //imagen compuesto { 'imagen': imagen, 'votos': [{ 'usuario': 'admin', 'voto': 'positivo' }, { 'usuario': 'usuario', 'voto': 'negativo' }] }
    imagen.votos.push({ 'usuario': this.currentUser.name, 'voto': calificacion });
    this.firestoreService.actualizar('votaciones', imagen.id, imagen);
    this.leerTodasLasVotaciones();
    this.calcularVotacionDeImagen(this.imgSeleccionada);
  }
  votarFotografia(calificacion, fotografia) {
    let existVote = false;
    let existImg = false;
    let auxVotacion;
    this.listaDeVotaciones.forEach(votacion => {
      if (fotografia.imgName == votacion.imagen) {
        existImg = true;
        auxVotacion = votacion;//si la encuentro guardo la votacion actual
      }
    });
    if (existImg && auxVotacion) {
      auxVotacion.votos.forEach(voto => {
        voto.usuario == this.currentUser.name ? existVote = true : null;//verifico que no halla votado aun.
      });
      if (!existVote) {//sino voto, agrego el voto
        this.agregarVotacion(auxVotacion, calificacion);
        this.presentToast('Voto registrado', 2000, 'success', 'Listo');

      }
      else {
        this.presentToast('Usted ya voto en esta fotografia', 2000, 'warning', 'Doble voto');
      }
    }
  }
  calcularVotacionDeImagen(archivo) {
    this.listaDeVotaciones.forEach(votacion => {
      if (votacion.imagen == archivo.imgName) {
        this.firestoreService.obtenerById(votacion.id).subscribe((res: any) => {
          let cantVotos = 0;
          res.payload.data().votos.forEach(element => {
            element.voto == 'like' ? cantVotos++ : cantVotos--;
          });
          this.imgSeleccionada.votos = cantVotos;
        });
      }
    });
  }
  toggleChart() {
    this.showChart = !this.showChart;
  }
  mostrarInformacionDeArchivo(archivo) {
    archivo.votos = 0;
    this.imgSeleccionada = archivo;
    this.calcularVotacionDeImagen(archivo);
  }
  toggleFullImg() {
    this.showFullImg ? this.showFullImg = false : this.showFullImg = true;
  }
  descomponerNombreDeImagen(imgName: string, link: string) {
    let datos = imgName.split('_');
    let user = datos[0];
    let date = new Date(parseInt(datos[1]));
    let type = datos[2].split('.')[0];
    let archivo = { 'fecha': date, 'link': link, 'usuario': user, 'tipo': type, 'imgName': imgName }
    return archivo;
  }
  /*
   * 
   * @param tipo es el tipo que seleccionara que fotos mostrar fotosLindas, fotosFeas y todas
   */
  filtrarListaPorTipo(tipo: string) {
    this.listaFiltrada = [];
    this.listaDeImagenes.forEach(archivo => {
      if (archivo.tipo == tipo) {
        this.listaFiltrada.push(archivo);
      }
      else if (tipo == 'todas') {
        this.listaFiltrada.push(archivo);
      }
    });
    this.ordenarPorFecha(this.listaFiltrada);
  }

  ordenarPorFecha(lista) {

    lista.sort(function (a, b) {
      if (a.fecha > b.fecha) {
        return -1;
      }
      if (a.fecha < b.fecha) {
        return 1;
      }
      // a must be equal to b
      return 0;
    });

    this.listaDeImagenes = this.listaFiltrada;
  }

  obtenerListaDeImagenes() {
    let auxLista = [];
    this.spinner = true;
    this.angularFireStorage.storage.ref().listAll().then((lista) => {
      lista.items.forEach(item => {
        item.getDownloadURL().then((link) => {
          let archivo = this.descomponerNombreDeImagen(item.name, link);
          auxLista.push(archivo);
        });
      });
      setTimeout(() => {
        this.listaDeImagenes = auxLista;
        this.spinner = false;
        this.filtrarListaPorTipo(this.currentUser.galery);
        this.filtrarListaPorUsuario(this.currentUser.name);

      }, 3000);
    });
  }
  componerNombreDeImagen(usuario: string, fecha: number, tipo: string) {
    this.nombreDeImagen = usuario + '_' + fecha + '_' + tipo + '.jpg';
    this.pathDeImagen = this.storageRef.child(usuario + '_' + fecha + '_' + tipo + '.jpg');

  }
  compararFechas(fechaA, fechaB) {
    if (fechaA < fechaB) {
      return -1;
    }
    if (fechaA > fechaB) {
      return 1;
    }
    // a debe ser igual b
    return 0;
  }
  subirImagenAFireStorage() {

    this.pathDeImagen.putString(this.imagen, 'data_url').then((response) => {
      this.obtenerListaDeImagenes();
      this.presentToast("La imagen se subio con exito", 2000, 'success', 'Imagen subida');
    });
  }
  tomarFotografia() {

    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      this.spinner = true;
      this.imagen = 'data:image/jpeg;base64,' + imageData;
      this.componerNombreDeImagen(this.currentUser.name, new Date().getTime(), this.currentUser.galery);//le paso el usuario + fecha en milisegundos + tipo de foto
      this.subirImagenAFireStorage();
      this.firestoreService.crear('votaciones', { 'imagen': this.nombreDeImagen, 'votos': [] });
    }, (err) => {
      this.presentToast(err, 2000, 'danger', 'ERROR');
    });


  }

  async presentToast(mensaje: string, duracion: number, color: string, titulo: string, boton?: boolean,
    tituloBotonUno?: string, tituloBotonDos?: string, urlUno?: string, urlDos?: string) {
    let toast;
    if (boton) {
      toast = await this.toast.create({
        message: mensaje,
        duration: duracion,
        color: color,
        header: titulo,
        buttons: [
          {
            side: "end",
            text: tituloBotonUno,
            handler: () => {
              this.router.navigateByUrl("/" + urlUno);
            }
          },
          {
            side: "end",
            text: tituloBotonDos,
            handler: () => {
              this.router.navigateByUrl("/" + urlDos);
            }
          }
        ]

      });
    }
    else {
      toast = await this.toast.create({
        message: mensaje,
        duration: duracion,
        color: color,
        header: titulo
      });
    }
    toast.present();
  }

  filtrarListaPorUsuario(usuario: string) {
    this.listaDeImagenesPropias = [];

    this.listaDeImagenes.forEach(archivo => {
      if (archivo.usuario == usuario) {
        this.listaDeImagenesPropias.push(archivo);
      }
    });
    this.ordenarPorFecha(this.listaDeImagenesPropias);
  }
}