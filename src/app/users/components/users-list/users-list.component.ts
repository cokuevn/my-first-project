import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UsersApiService } from '../../services/users-api.service';
import { UsersService } from '../../services/users.service';
import { Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CreateEditUserComponent } from '../create-edit-user/create-edit-user.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../shared/user.interface';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();

  constructor(
    public dialogRef: MatDialog,
    public usersService: UsersService,
    private usersApiService: UsersApiService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    const currentUsers = this.localStorageService.getItem('currentUsers');
    if (currentUsers) {
      this.usersService.setUsers(JSON.parse(currentUsers));
      this.usersApiService
        .getUsers()
        .subscribe((users) =>
          this.localStorageService.setItem(
            'currentUsers',
            JSON.stringify(users)
          )
        );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  onDeleteUser(id: number) {
    this.usersService.deleteUser(id);
    this.localStorageService.setItem(
      'currentUsers',
      JSON.stringify(this.usersService.users)
    );
  }

  openDialog(user?: User) {
    const dialogRef = this.dialogRef.open(CreateEditUserComponent, {
      width: '400px',
      data: user ? { ...user } : null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (user) {
          this.usersService.updateUser(result);
        } else {
          this.usersService.addUser(result);
        }
        this.localStorageService.setItem(
          'currentUsers',
          JSON.stringify(this.usersService.users)
        );
      }
    });
  }
}
