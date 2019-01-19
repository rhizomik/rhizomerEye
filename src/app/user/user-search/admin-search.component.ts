import {Component, Input, EventEmitter, Output} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Admin} from '../admin';
import {AdminService} from '../admin.service';

@Component({
  selector: 'app-admin-search',
  templateUrl: './user-search.component.html'
})

export class AdminSearchComponent {
  @Input()
  admins: Admin[];
  @Output()
  emitResults: EventEmitter<any> = new EventEmitter();

  public errorMessage: string;

  constructor(private adminService: AdminService) {
  }

  performSearch(searchTerm: string): void {
    this.adminService.getAdminsByUsername(searchTerm).subscribe(
      admins => {
        this.emitResults.emit(admins);
      });
  }
}

