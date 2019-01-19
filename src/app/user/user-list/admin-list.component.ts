import {Component, OnInit} from '@angular/core';
import {AdminService} from '../admin.service';
import {Admin} from '../admin';

@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html'
})
export class AdminListComponent implements OnInit {
  public admins: Admin[] = [];
  public totalAdmins = 0;
  public errorMessage = '';

  constructor(private adminService: AdminService) {
  }

  ngOnInit() {
    this.adminService.getAllAdmins()
      .subscribe(
        (admins: Admin[]) => {
          this.admins = admins;
          this.totalAdmins = admins.length;
        });
  }

  showSearchResults(admins) {
    this.admins = admins;
  }
}
