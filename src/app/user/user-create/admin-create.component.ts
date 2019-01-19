import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Admin} from '../admin';
import {AdminService} from '../admin.service';

@Component({
  selector: 'app-admin-create',
  templateUrl: '../user-form/user-form.component.html'
})
export class AdminCreateComponent implements OnInit {
  public user: Admin;
  public errorMessage: string;
  public formTitle = 'Register Administrator';
  public formSubtitle = 'Register a new user with role administrator';

  constructor(private router: Router,
              private adminService: AdminService) {
  }

  ngOnInit() {
    this.user = new Admin();
  }

  onSubmit(): void {
    this.adminService.addAdmin(this.user)
      .subscribe(
        admin => this.router.navigate([admin.uri]));
  }
}
