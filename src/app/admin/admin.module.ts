import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminPageRoutingModule } from './admin-routing.module';

import { AdminPage } from './admin.page';
import { FechaPipe } from 'src/app/pipes/fecha.pipe';
import {InputSwitchModule} from 'primeng/inputswitch';
import {ChartModule} from 'primeng/chart';
import { ChartComponent} from 'src/app/components/chart/chart.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminPageRoutingModule,
    InputSwitchModule,
    ChartModule
  ],
  declarations: [AdminPage,FechaPipe,ChartComponent],
  providers: [FechaPipe]
})
export class AdminPageModule { }
