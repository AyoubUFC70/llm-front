import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http'
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isLoading = false;
  importSuccessful = false;
  errorMessage?: string;
  showSuccessMsg = false;
  showErrorDialog = false;
    
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    
  }
  

  startSimulation(): void {
    console.log('Starting Simulation');
    this.isLoading = true;
    this.errorMessage = undefined;

    this.apiService.importPackages().subscribe({
      next: (response) => {
        console.log('Message:', response.message);
    
        console.log("Packages imported successfully: ", response);
        /* this.handleImportSuccess(response); */
        this.isLoading = false;
        this.importSuccessful = true;
        this.showSuccessMsg = true;

      },
      error: (error) => {
        console.error("Error importing packages: ", error);
        const errorMessage = 'An unknown error occured while importing packages.'
        this.errorMessage = errorMessage;
        this.isLoading = false;
        this.errorMessage = "An error occured while importing packages!";
      },
      complete: () => {
        this.isLoading = false;
        this.showErrorDialog = false;
        this.showSuccessMsg = false;
      }
    });
  }
  
 /*  handleImportSuccess(response: HttpResponse<any>): void {
    if (!response) {
      console.error('Error importing packages: Unexpected defined response');
      this.errorMessage = "Unexpected defined response";
      this.isLoading = false;
      return;
    }

    if (response.body && response.body.message === 'Packages imported successfully') {
      console.log("Packages imported successfully!!!");
      this.isLoading = false;
      this.importSuccessful = true;
      this.showSuccessMsg = true;
    } else {
      const errorMessage = 'An unknown error occured while importing packages.'
      console.error('Import error: ', errorMessage);
      this.errorMessage = errorMessage;
      this.isLoading = false;
      this.showErrorDialog = true;
    }
  } */
}
