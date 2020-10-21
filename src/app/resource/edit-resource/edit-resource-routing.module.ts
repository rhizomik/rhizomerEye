import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditResourceComponent } from './edit-resource.component';

const routes: Routes = [
  { path: '', component: EditResourceComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditResourceRoutingModule { }
