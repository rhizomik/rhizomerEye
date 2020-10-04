import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResourceRoutingModule } from './resource-routing.module';
import { ResourceComponent } from './resource.component';
import { DescriptionModule } from '../description/description.module';
import { CKEditorModule } from 'ckeditor4-angular';

@NgModule({
  declarations: [ResourceComponent],
  imports: [
    CommonModule,
    ResourceRoutingModule,
    DescriptionModule,
    CKEditorModule
  ]
})
export class ResourceModule { }
