import { Injectable } from '@angular/core';
import { AngularFirestore} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {



  constructor(private firestore: AngularFirestore) {
  }


  //Crea un nuevo dato
  public crear(collection: string, data: any) {
    return this.firestore.collection(collection).add(data);
  }
  //Obtiene un datoS
  public obtenerById(documentId: string) {
    return this.firestore.collection('votaciones').doc(documentId).snapshotChanges();
  }
  //Obtiene todos los datos
  public obtenerTodos(collection) {
    return this.firestore.collection(collection).snapshotChanges();
  }
  //Actualiza un dato
  public actualizar(collection: string, documentId: string, data: any) {
    return this.firestore.collection(collection).doc(documentId).set(data);
  }

}
