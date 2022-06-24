import { Component, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

import { Inject } from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDialog} from '@angular/material/dialog';
import {MatDialogRef} from '@angular/material/dialog';
import { FetchDetailsServiceService } from "../fetch-details-service.service";
import { HypothecationModel } from "../HypothecationModel";
import {ErrordialogComponent} from '../errordialog/errordialog.component';
import {ReasondialogComponent} from '../reasondialog/reasondialog.component';
import {SpinnerService} from '../SpinnerService';

@Component({
  selector: 'app-checkerdialog',
  templateUrl: './checkerdialog.component.html',
  styleUrls: ['./checkerdialog.component.css']
})
export class CheckerdialogComponent implements OnInit {
objectURL: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
   public dialogRef: MatDialogRef<CheckerdialogComponent>, public dialog: MatDialog,public service: FetchDetailsServiceService, private spinnerService : SpinnerService) { 
     this.referenceNo = this.data.referenceNo;
     this.loanAccountNo = this.data.foracid;
     this.objectURL = 'data:image/png;base64,' + this.data.image;
     this.spinnerService.spinnerActive.subscribe(active => 
     this.toggleSpinner(active)); 
   }

  ngOnInit(): void {
  }

  hypothecationModel: HypothecationModel = new HypothecationModel();
activeSpinner: boolean = false;
  referenceNo: string = "";
  loanAccountNo: string = "";
  registrationNo: string = "";
  chassisNo: string = "";
  terminationDate: string = "";
  disableSubmitForCancellation: boolean = true;
  responsefromservice: string = "";



  submitForCancellation(){
    this.hypothecationModel.id = this.referenceNo;
    this.spinnerService.activate();
    this.service.cancelHypothecation(this.hypothecationModel).subscribe(
      data=> {
        this.responsefromservice = data.response;
        this.dialogRef.close({ data :{'data': this.responsefromservice} });
        

      },
      error=> {
        this.dialogRef.close({ data: 'unable to process your request. please contact admin.' });
      }
    );

  }

  editDetails() {

  }

  reject() {
    const dialogRef = this.dialog.open(ReasondialogComponent, {
            
        });

        dialogRef.afterClosed().subscribe(result => { console.log("status is"+result.data.status);
        if(result.data.status === true) {
          this.hypothecationModel.id = this.referenceNo;
          this.hypothecationModel.vahan_response = result.data.message;
    this.spinnerService.activate();
    this.service.reject(this.hypothecationModel).subscribe(
      data=> {
        if(data.response === "success") {
           this.dialogRef.close({ data :{'data': 'Rejected the request successfully.'} });

        } else {
          this.dialogRef.close({ data :{'data': 'Failed to reject the request.'} });
        }
      }
    );
        } });
    
  }

  fetchDetails(){
    this.hypothecationModel.id = this.referenceNo;
    this.hypothecationModel.foracid = this.loanAccountNo;
    this.hypothecationModel.regnNo = this.registrationNo;
    this.hypothecationModel.chassisNo = this.chassisNo;
    this.spinnerService.activate();
    this.service.validateDetails(this.hypothecationModel).subscribe(
      data=> {
        this.spinnerService.deactivate();
        if(data.response === "true"){
             const dialogRef = this.dialog.open(ErrordialogComponent, {
            
            data :{'data': 'This will automatically terminate Hypothecation. Please Exercise caution. Click submit to proceed.'}
        });
        this.disableSubmitForCancellation = false;
        
         }
        else if(data.response === "false"){
          this.spinnerService.deactivate();
             const dialogRef = this.dialog.open(ErrordialogComponent, {
            
            data :{'data': 'Validation failed. Please try again.'}
        });
        
       
        }

      },
      error=> {
        this.spinnerService.deactivate();
             const dialogRef = this.dialog.open(ErrordialogComponent, {
            
            data :{'data': 'Unable to process your request, Please try again.'}
      }
    );

  });}


   toggleSpinner(active){
      this.activeSpinner = active
    }

}
