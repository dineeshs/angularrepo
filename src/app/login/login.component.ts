import { Component, OnInit } from '@angular/core';
import {FetchDetailsServiceService} from '../fetch-details-service.service';
import {SpinnerService} from '../SpinnerService';
import { Router } from '@angular/router';
import {TokenStorage} from '../TokenStorage';
import {Observable} from 'rxjs';
import {LoginResponse} from '../LoginResponse';
import {MatDialog} from '@angular/material/dialog';
import {ErrordialogComponent} from '../errordialog/errordialog.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username:string;
  password:string;
  activeSpinner: boolean = false;
  otp:string;
  otpvalidate: boolean = false;
  public tokenDetails: LoginResponse;

  constructor(public dialog: MatDialog,private service: FetchDetailsServiceService, private spinnerService : SpinnerService, private router: Router, private token: TokenStorage) { 
     this.spinnerService.spinnerActive.subscribe(active => 
     this.toggleSpinner(active)); 
  }

  ngOnInit(): void {
  }

  login() {
    //this.service.
     this.spinnerService.activate();
    // setTimeout(() => {
     
      
    // }, 5000);
    this.service.loginService(this.username, this.password).subscribe(
       data => {


        this.tokenDetails = data;
        
        if(this.tokenDetails.role === "EXCEPTION")
        {

          const dialogRef = this.dialog.open(ErrordialogComponent, {
            
            data :{'data': 'We could not process your request. Contact admin. '}
        });
          console.log("exception")
          this.spinnerService.deactivate();

        }

        else if(this.tokenDetails.role === "FAILURE")
        {

          const dialogRef = this.dialog.open(ErrordialogComponent, {
            
            data :{'data': 'Invalid username/password.'}
        });
          console.log("exception")
          this.spinnerService.deactivate();

        }
        else {
          this.token.saveToken(this.tokenDetails.token);
        this.token.saveSolid(this.tokenDetails.solid);
        this.service.userRole = this.tokenDetails.role;
          this.token.saveRole(this.tokenDetails.role);
          this.token.saveAdName(this.tokenDetails.adname);
          this.token.saveScale(this.tokenDetails.scale);
        //this.isLoggedIn = true;
        //this.router.navigate(['/cancel']);
        this.spinnerService.deactivate();
        this.otpvalidate = true;
        }
        

      },
      error =>  {
        this.spinnerService.deactivate(); }
    );
  }

  submitOtp() {

    this.spinnerService.activate();
    if(this.otp==='123456'){
      this.service.isLoggedIn = true;
      this.router.navigate(['/cancel']);
    } else {
      const dialogRef = this.dialog.open(ErrordialogComponent, {
            
            data :{'data': 'Invalid otp.'}
        });
    }
    this.spinnerService.deactivate();

  }

   toggleSpinner(active){
      this.activeSpinner = active
    }

}
