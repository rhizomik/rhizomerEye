import {Component, Input, EventEmitter, Output} from '@angular/core';
import {UserService} from '../user.service';
import { User } from '../../login-basic/user';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html'
})

export class UserSearchComponent {
  @Input()
  users: User[];
  @Output()
  emitResults: EventEmitter<any> = new EventEmitter();

  public errorMessage: string;

  constructor(private userService: UserService) {
  }

  performSearch(searchTerm: string): void {
    this.userService.findByUsernameContaining(searchTerm).subscribe(
      users => {
        this.emitResults.emit(users);
      });
  }
}

