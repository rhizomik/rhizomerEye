import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResourceRoutingModule } from './resource-routing.module';
import { ResourceComponent } from './resource.component';
import { DescriptionModule } from '../description/description.module';
import { CKEditorModule } from 'ckeditor4-angular';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ResourceComponent],
    imports: [
        CommonModule,
        ResourceRoutingModule,
        DescriptionModule,
        CKEditorModule,
        FormsModule
    ]
})
export class ResourceModule { }
