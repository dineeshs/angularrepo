import { Component, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

import { Inject } from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDialog} from '@angular/material/dialog';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-reasondialog',
  templateUrl: './reasondialog.component.html',
  styleUrls: ['./reasondialog.component.css']
})
export class ReasondialogComponent implements OnInit {

rejectmessage: string = "";
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
   public dialogRef: MatDialogRef<ReasondialogComponent>) { }

  ngOnInit(): void {
  }

  proceed() {
     this.dialogRef.close({ data :{'message': this.rejectmessage, 'status':true} });
  }

}
