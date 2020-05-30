import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ChapterDetailsPage } from './chapter-details.page';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '@app/app/components/components.module';

const routes: Routes = [
  {
    path: '',
    component: ChapterDetailsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommonConsumptionModule,
    ComponentsModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes),
  ],
  declarations: [ChapterDetailsPage]
})
export class ChapterDetailsPageModule {}