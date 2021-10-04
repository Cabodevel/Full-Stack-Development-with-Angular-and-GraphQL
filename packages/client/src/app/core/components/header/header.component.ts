import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { User, SearchUsersResponse, UsersResponse } from 'src/app/shared';
import { AuthService } from 'src/app/core';
import { SearchDialogComponent } from '../search-dialog/search-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @ViewChild('searchInput') searchInput: ElementRef | null = null;
  fetchMore: (users: User[]) => void = (users: User[]) => { };
  constructor(
    public authService: AuthService,
    public matDialog: MatDialog,
    private router: Router, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }
  logOut(): void {
    this.authService.logOut();
    this.router.navigateByUrl('/users/login');
  }
  searchUsers(): void {
    const searchText = this.searchInput?.nativeElement.value;
    if(searchText == ''){
      this.snackBar.open('Please enter a search term', 'Ok', {
        duration: 5 * 1000
      });
      return;
    }
    const result: SearchUsersResponse = this.authService.searchUsers(searchText, 0, 10);
    const dialogConfig = new MatDialogConfig<SearchUsersResponse>();
    dialogConfig.data = result;
    /*
    - We subscribe to the Observable to fetch data and check if any users are found
    before we open the dialog.
    - We unsubscribe using the first() operator.
    - We change the fetch policy to 'cache-first' in the AuthService' searchUsers() method
    to avoid sending multiple requests since we are subscribing to this Observable
    in the dialog component too.
    */
    result.data.pipe(first()).subscribe((data: UsersResponse)=> {

      if(data.searchUsers.length > 0) this.matDialog.open(SearchDialogComponent, dialogConfig);
      else {
        this.snackBar.open('No users found with this search term', 'Ok', {
          duration: 5 * 1000
        });
      }
    });

  }

}

