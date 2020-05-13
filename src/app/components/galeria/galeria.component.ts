import { Component, OnInit } from '@angular/core';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion/ngx';

@Component({
  selector: 'app-galeria',
  templateUrl: './galeria.component.html',
  styleUrls: ['./galeria.component.scss'],
})
export class GaleriaComponent implements OnInit {

  accelerationX;
  accelerationY;
  accelerationZ;
  subscription: any;
  constructor(
    private deviceMotion: DeviceMotion
  ) { }

  ngOnInit() { }

  start() {
    this.subscription = this.deviceMotion.watchAcceleration({ frequency: 300 }).subscribe((acceleration: DeviceMotionAccelerationData) => {
      this.accelerationX = Math.floor(acceleration.x);
      this.accelerationY = Math.floor(acceleration.y);
      this.accelerationZ = Math.floor(acceleration.z);

      if (acceleration.x > 5) {
        //Izquierda

      }
      else if (acceleration.x < -5) {
        //derecha

      }

    });
  }

  stop() {
    this.subscription.unsubscribe();
  }
}
