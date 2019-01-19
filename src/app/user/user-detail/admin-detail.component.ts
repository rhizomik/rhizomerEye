import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AdminService} from '../admin.service';
import {Admin} from '../admin';

@Component({
  selector: 'app-admin-detail',
  templateUrl: './user-detail.component.html'
})
export class AdminDetailComponent implements OnInit {
  public user: Admin = new Admin();
  public errorMessage: string;
  public detailsPageTitle = 'Administrator';
  public detailsPageSubtitle = 'Details about a registered user with role ADMINISTRATOR';

  constructor(private route: ActivatedRoute,
              private adminService: AdminService,
              private router: Router) {
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.adminService.getAdmin(id).subscribe(
      admin => this.user = admin);
  }

  public delete() {
    this.adminService.deleteAdmin(this.user).subscribe(
      () => this.router.navigate(['admins']));
  }
}
