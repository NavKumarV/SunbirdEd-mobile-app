import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';
import { ShowcasePage } from './showcase.page';
import { ComponentsModule } from '@app/app/components/components.module';

const routes: Routes = [
  {
    path: '',
    component: ShowcasePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ComponentsModule
  ],
  declarations: [ShowcasePage]
})
export class ShowcasePageModule {}
