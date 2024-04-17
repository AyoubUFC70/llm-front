import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, forkJoin, switchMap } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CommunicationService } from 'src/app/services/communication.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  isSidebarCollapsed: boolean = false;
  documents: any[] = [];
  msgSuccess: any[] = [];
  msgError: any[] = [];
  isLoading = false;
  @Output() startNewChatEvent = new EventEmitter<void>();

  constructor(private apiService: ApiService, private router: Router, private loadingService: CommunicationService) { }

  ngOnInit(): void {
    this.getUploadedDocuments();
  }

  startNewChat(): void {
    /* this.startNewChatEvent.emit(); */
    this.apiService.buildChain().subscribe(() => {
      console.log('retry chat with documents');
      window.location.reload();
    }, error => {
      console.log('error retry chat: ', error);
    });
  }

  getUploadedDocuments(): void {
    this.apiService.getUploadedDocuments().subscribe(
      response => {
        this.documents = response.uploaded_documents;
    },
      error => {
        console.error('Error fetching uploaded documents: ', error);
        this.msgError.push('Error fetching uploaded documents');
      }
    ); 
  }

  deleteDocument(document: any): void {
    const documentName = document.name;
    this.apiService.deleteDocument(documentName).subscribe(
      response => {
        this.msgSuccess.push('Deleted successfully');
        this.getUploadedDocuments();
      },
      error => {
        console.error('Error deleting document: ', error);
        this.msgError.push('Error deleting document');
      }
    );
  }

  chooseFile(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf, .doc, .docx, .txt';
    input.addEventListener('change', (event) => {
      this.uploadFiles(event);
    });
    input.click();
  }

  uploadFiles(event: any): void {
    this.loadingService.setLoadingState(true);
    this.isLoading = true;
    const files = event.target.files;
    const selectedFiles = [];

    for (let i = 0 ; i < files.length ; i++) {
      selectedFiles.push(this.apiService.uploadFiles(files[i]));
    }

    forkJoin(selectedFiles).subscribe(() => {
      console.log('All files uploaded successfully');
      this.msgSuccess.push('Documents Uploaded Successfully');
      this.refreshUploadedDocuments();
      this.apiService.continueExecution().pipe(
        switchMap(() => {
          console.log('call endpoint create embeddings');
          return this.apiService.createEmbeddings();
        }),
        switchMap(() => {
          console.log('call endpoint llm model');
          return this.apiService.llmModel();
        }),
        switchMap(() => {
          console.log('call endpoint build chain');
          return this.apiService.buildChain();
        }),
        finalize(() => {
          console.log('Finalizing...');
          this.loadingService.setLoadingState(false);
          this.isLoading = false;
          this.goToChatDocuments();
          console.log('Go to chat interface');
        })
      ).subscribe(() => {
        this.msgSuccess.push('Starting Chat');
        console.log('Success!');
      }, error => {
        console.error('Error: ', error);
      }); 
    },
    error => {
      console.log('Error uploading document: ', error);
      this.msgError.push('Error uploading document');
    });          

  } 

  refreshUploadedDocuments(): void {
    this.apiService.getUploadedDocuments().subscribe(
      response => {
        this.documents = response.uploaded_documents;
      },
      error => {
        console.log('Error fetching uploaded documents: ', error);
        this.msgError.push('Error fetching uploaded documents');
        this.loadingService.setLoadingState(false);
        this.isLoading = false;
      }
    )
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  dismissMsg(index: number): void {
    this.msgSuccess.splice(index, 1);
  }

  dismissErrMsg(index: number): void {
    this.msgError.splice(index, 1);
  }

  goToChatDocuments(): void {
    this.router.navigate(['/chat-documents']);
  }
}
