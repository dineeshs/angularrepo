import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import { FetchdetailsdialogComponent } from "../fetchdetailsdialog/fetchdetailsdialog.component";
import { FetchDetailsServiceService } from "../fetch-details-service.service"
import { AreyousuredialogComponent } from "../areyousuredialog/areyousuredialog.component";
import { HypothecationModel } from "../HypothecationModel";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {SecurityDetails} from '../SecurityDetails';
import {PendingRequests } from '../PendingRequests';
import {SpinnerService} from '../SpinnerService';
import {ErrordialogComponent} from '../errordialog/errordialog.component';
import {CheckerdialogComponent} from '../checkerdialog/checkerdialog.component';
import {CancellationResponse} from '../CancellationResponse';
import { MatTableDataSource } from '@angular/material/table';
import {SecurityResponse} from '../SecurityResponse';
import { Router } from '@angular/router';
import {TokenStorage} from '../TokenStorage';
import * as XLSX from 'xlsx';
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}



@Component({
  selector: 'app-hpt-input-details',
  templateUrl: './hpt-input-details.component.html',
  styleUrls: ['./hpt-input-details.component.css']
})
/** Error when invalid control is dirty, touched, or submitted. */
export class HptInputDetailsComponent   {
  ELEMENT_DATA: PendingRequests[] = [
  
];

fileName= 'ExcelSheet.xlsx';
activeSpinner: boolean = false;
  apiResponse: CancellationResponse = new CancellationResponse();
  fileControl: FormControl;
  multiple;
  accept=".png, .jpg, .jpeg";
  color;
  public files;
  public informationForm;
  loanAccountNo: string = "";
  registrationNo: string = "";
  image: any = null;
  chassisNo: string = "";
  terminationDate: string = "";
  referenceNo: string = "";
  disableSubmitForCancellation: boolean = true;
  hypothecationModel: HypothecationModel = new HypothecationModel();
  securityDetails: SecurityDetails[];
  securityResponse: SecurityResponse;
  panelOpenState = false;
  pendingRequests: PendingRequests[];
   displayedColumns: string[] = ['no', 'chassisno', 'loanaccountno', 'action'];
   displayedColumnsNew: string[] = ['no','referenceno', 'solid', 'loanaccountno', 'chassisno', 'registrationno', 'maker',
   'makerdate', 'checker', 'checkerdate', 'vahanresponse'];
  dataSource = new MatTableDataSource<PendingRequests>();
  completedDataSource = new MatTableDataSource<HypothecationModel>();
  role: string;
  showTerminationDate: boolean = false;
  constructor(public dialog: MatDialog, public service: FetchDetailsServiceService, private http: HttpClient, private spinnerService : SpinnerService,
  private router: Router, private token: TokenStorage) {
    this.spinnerService.spinnerActive.subscribe(active => 
     this.toggleSpinner(active)); 
     this.role = this.service.userRole;
     if(this.role === 'MAKER') {
       this.displayedColumns = ['no', 'chassisno', 'loanaccountno'];
     }

     this.fileControl = new FormControl();

      this.fileControl.valueChanges.subscribe((files: any) => {
      if (!Array.isArray(files)) {
        this.files = [files];
      } else {
        this.files = files;
      }
    });

    this.fetchPendingRequests();

  }
    emailFormControl = new FormControl('', [Validators.required, Validators.email]);

    openDialog(details: SecurityDetails[], status: string) {
      this.disableSubmitForCancellation = true;
      const dialogRef = this.dialog.open(FetchdetailsdialogComponent, {
            
            data :{'loanAccountNo': details, 'status': status}
        });

    dialogRef.afterClosed().subscribe(result => {
      this.disableSubmitForCancellation = result.data;
    });
  }

  submitForCancellation() {
    const dialogRef = this.dialog.open(AreyousuredialogComponent, {
            
        });

        console.log("files uploaded"+this.files)

    dialogRef.afterClosed().subscribe(result => {
      
      if(result.data === true) {
        this.spinnerService.activate();
        this.hypothecationModel.regnNo = this.registrationNo;
        this.hypothecationModel.chassisNo = this.chassisNo;
        this.hypothecationModel.terminationDt=  this.terminationDate;
        this.hypothecationModel.foracid = this.loanAccountNo;
       // this.hypothecationModel.solid = this.token.
        this.service.requestHypothecationCancelService(this.hypothecationModel, this.files).subscribe(
      data=> {
        this.apiResponse = data;
        console.log("insertmethodapi"+this.apiResponse);
        
        if(this.apiResponse.response === "success") {
          this.hypothecationModel = new HypothecationModel();
          this.registrationNo = "";
          this.chassisNo="";
          this.terminationDate="";
          this.loanAccountNo="";
          this.disableSubmitForCancellation = true;
          const dialogRef = this.dialog.open(ErrordialogComponent, {
            
            data :{'data': 'Successful. Request forwarded to checker.'}
        });
        } else
 {
   const dialogRef = this.dialog.open(ErrordialogComponent, {
            
            data :{'data': 'Request failed. Please try again/ contact admin.'}
        });
 }        
        this.spinnerService.deactivate();
      },
      error=> {
        console.log("insertmethodapieror"+error)
        const dialogRef = this.dialog.open(ErrordialogComponent, {
            
            data :{'data': 'Request failed. Please try again/ contact admin.'}
        });
        this.spinnerService.deactivate();
      }
    );
      
      
      }
    });


  }

  editDetails() {
    this.disableSubmitForCancellation = true;
  }

  csvInputChange(fileInputEvent: any) {
    console.log("files uploaded"+fileInputEvent.target.files[0]);
    this.files = fileInputEvent.target.files[0];
  }

  fetchDetails() {
    console.log("inside fetch details hpt input details")
    this.hypothecationModel.foracid = this.loanAccountNo;
    this.service.fetchDetails(this.hypothecationModel).subscribe(
      data=> {
        console.log("data received from service:" +data)
        this.securityResponse = data;
        this.securityDetails = this.securityResponse.securityDetails;
        this.spinnerService.deactivate();
        if(this.securityResponse.status === "NODATAFOUND")
        {
          const dialogRef = this.dialog.open(ErrordialogComponent, {
            
            data :{'data': 'No record found with the given details in your sol id/ Loan account still opened in Finacle.'}
        });
        } else if(this.securityResponse.status === "DUPLICATE") {
           const dialogRef = this.dialog.open(ErrordialogComponent, {
            
            data :{'data': 'This record is already under process/ completed. Please check in pending/completed requests tab.'}
        });
        }
        else
        this.openDialog(this.securityDetails, this.securityResponse.status)
      },
      error=>{
        console.log("error"+error);
        this.spinnerService.deactivate();
      }
    );
    
    
  }

  fetchPendingRequests() {
    this.spinnerService.activate();
    this.service.fetchPendingRequests(this.hypothecationModel).subscribe(
      data=> {
        console.log(data);
        this.dataSource.data = data;
        //(this.dataSource.data[0]).rcbook = 'data:image/jpeg;base64,' + data.rcbook;
        //this.pendingRequests = data;
        console.log("pendingRequests"+this.pendingRequests)
        //this.ELEMENT_DATA = data;
        console.log(this.ELEMENT_DATA);
        this.spinnerService.deactivate();

      },error=> {
        console.log(error);
                this.spinnerService.deactivate();

      }
    );
  }

  onFileSelected(event) {
        if (event.target.files.length > 0) {
        const file = event.target.files[0];
        this.files = file;
        }
    }

  tabClick(tabevent) {
     console.log('tab clicked')
      console.log(tabevent)
    if(tabevent.tab.textLabel === 'Pending Requests') {
      console.log('tab clicked')
      this.fetchPendingRequests();
    }
    if(tabevent.tab.textLabel === 'Completed Requests') {
      console.log('tab clicked')
      this.fetchCompletedRequests();
    }
  }

  clickCheckerCancellationDetails(referenceNo, foracid, image) {
    console.log("image is"+ image);
    this.referenceNo = referenceNo;
    const dialogRef = this.dialog.open(CheckerdialogComponent, {
            
            data :{'referenceNo': this.referenceNo, 'foracid':foracid, 'image':image},
            autoFocus: false, 
      restoreFocus: false
        });
  
        dialogRef.afterClosed().subscribe(result => {
          this.spinnerService.deactivate();
         
          const dialogRef = this.dialog.open(ErrordialogComponent, {
            
            data :{'data': result.data.data}
        });
        this.fetchPendingRequests();

        });

      

  }

  fetchCancellationDetails(referenceNo) {
    // this.service.fetchCancellationDetails(referenceNo).subscribe(
    //   data=> {

    //   },
    //   error => {

    //   }
    // );
  }

  fetchCompletedRequests() {
    this.service.fetchCompletedRequests(this.hypothecationModel).subscribe(
      data=>{
        this.completedDataSource.data  = data;
      },
      error=>{

      }
    )
  }

  toggleSpinner(active){
      this.activeSpinner = active
    }

     numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }


  logout() {
    this.spinnerService.activate();
    this.token.signOut();
    setTimeout(() => {
      this.spinnerService.deactivate();
      this.router.navigate(['/login'])
      
    }, 2000);
  }

  exportexcel(): void
  {
    /* pass here the table id */
    this.spinnerService.activate();
    let element = document.getElementById('excel-table');
    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
 
    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
 
    /* save to file */  
    XLSX.writeFile(wb, this.fileName);
  }


}