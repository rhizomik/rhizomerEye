import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoggedInGuard } from './login-basic/loggedin.guard';
import { AdministratorGuard } from './login-basic/administrator.guard';
import { AboutComponent } from './about/about.component';
import { ListDatasetComponent } from './dataset/list-dataset/list-dataset.component';
import { DetailDatasetComponent } from './dataset/detail-dataset/detail-dataset.component';
import { ListClassComponent } from './class/list-class/list-class.component';
import { DetailClassComponent } from './class/detail-class/detail-class.component';
import { ListFacetComponent } from './facet/list-facet/list-facet.component';
import { AdminCreateComponent } from './user/user-create/admin-create.component';
import { AdminEditComponent } from './user/user-edit/admin-edit.component';
import { AdminDetailComponent } from './user/user-detail/admin-detail.component';
import { AdminListComponent } from './user/user-list/admin-list.component';
import { UserCreateComponent } from './user/user-create/user-create.component';
import { UserEditComponent } from './user/user-edit/user-edit.component';
import { UserDetailComponent } from './user/user-detail/user-detail.component';
import { UserListComponent } from './user/user-list/user-list.component';

const routes: Routes = [
  { path: 'datasets/:did/classes/:cid/facets', component: ListFacetComponent, canActivate: [LoggedInGuard] },
  { path: 'datasets/:did/classes/:cid', component: DetailClassComponent, canActivate: [LoggedInGuard] },
  { path: 'datasets/:did/classes', component: ListClassComponent, canActivate: [LoggedInGuard] },
  { path: 'datasets', component: ListDatasetComponent, canActivate: [LoggedInGuard] },
  { path: 'datasets/:did', component: DetailDatasetComponent, canActivate: [LoggedInGuard] },
  { path: 'admins/new', component: AdminCreateComponent, canActivate: [AdministratorGuard] },
  { path: 'admins/:id/edit', component: AdminEditComponent, canActivate: [AdministratorGuard] },
  { path: 'admins/:id', component: AdminDetailComponent, canActivate: [AdministratorGuard] },
  { path: 'admins', component: AdminListComponent, canActivate: [AdministratorGuard] },
  { path: 'users/new', component: UserCreateComponent, canActivate: [AdministratorGuard] },
  { path: 'users/:id/edit', component: UserEditComponent, canActivate: [AdministratorGuard] },
  { path: 'users/:id', component: UserDetailComponent, canActivate: [LoggedInGuard] },
  { path: 'users', component: UserListComponent, canActivate: [LoggedInGuard] },
  { path: 'about', component: AboutComponent },
  { path: '', redirectTo: 'about', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
