import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Router} from '@angular/router';
import {Admin} from '../admin';
import {AdminService} from '../admin.service';

@Component({
  selector: 'app-admin-edit',
  templateUrl: '../user-form/user-form.component.html'
})
export class AdminEditComponent implements OnInit {
  public user: Admin;
  public errorMessage: string;
  public formTitle = 'Edit Administrator';
  public formSubtitle = 'Edit a user with role administrator';

  constructor(private route: ActivatedRoute,
              private router: Router,
              private adminService: AdminService) {
  }

  ngOnInit() {
    this.user = new Admin();
    const id = this.route.snapshot.paramMap.get('id');
    this.adminService.getAdmin(id).subscribe(
      admin => this.user = admin);
  }

  onSubmit(): void {
    this.adminService.updateAdmin(this.user)
      .subscribe(
        admin => this.router.navigate([admin.uri]));
  }
}
