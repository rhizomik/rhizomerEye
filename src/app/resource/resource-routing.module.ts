import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResourceComponent } from './resource.component';
import { EditResourceComponent } from './edit-resource/edit-resource.component';

const routes: Routes = [
  { path: '', component: ResourceComponent },
  { path: 'edit', component: EditResourceComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourceRoutingModule { }
