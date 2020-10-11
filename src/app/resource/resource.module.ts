import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceRoutingModule } from './resource-routing.module';
import { DescriptionModule } from '../description/description.module';
import { CKEditorModule } from 'ckeditor4-angular';
import { FormsModule } from '@angular/forms';

import { ResourceComponent } from './resource.component';
import { EditResourceComponent } from './edit-resource/edit-resource.component';

@NgModule({
  declarations: [ResourceComponent, EditResourceComponent],
    imports: [
        CommonModule,
        ResourceRoutingModule,
        DescriptionModule,
        CKEditorModule,
        FormsModule
    ]
})
export class ResourceModule { }
