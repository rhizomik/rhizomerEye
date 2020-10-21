import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DescriptionComponent } from './description.component';
import { DescriptionRoutingModule } from './description-routing.module';

@NgModule({
  declarations: [DescriptionComponent],
  imports: [
    CommonModule,
    DescriptionRoutingModule
  ],
  exports: [DescriptionComponent]
})
export class DescriptionModule { }
