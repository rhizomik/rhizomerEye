import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditResourceRoutingModule } from './edit-resource-routing.module';
import { CKEditorModule } from 'ckeditor4-angular';
import { FormsModule } from '@angular/forms';

import { EditResourceComponent } from './edit-resource.component';

@NgModule({
  declarations: [EditResourceComponent],
    imports: [
        CommonModule,
        EditResourceRoutingModule,
        CKEditorModule,
        FormsModule
    ]
})
export class EditResourceModule { }
