import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'src/app/clases/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser:any;
  isLogged: any = false;
  constructor(private angularFireAuth: AngularFireAuth,
    ) {
    this.angularFireAuth.authState.subscribe(user => (this.isLogged = user));
  }


  //LOGIN
  async onLogin(user: User) {
    try {
      return await this.angularFireAuth.signInWithEmailAndPassword(user.email, user.password);
    } catch (error) {
      // console.log(error);
      return error;
    }
  }
  //REGISTER
  async onRegister(user: User) {
    try {
      return await this.angularFireAuth.createUserWithEmailAndPassword(user.email, user.password);
    } catch (error) {
      console.log(error);
    }
  }
}
