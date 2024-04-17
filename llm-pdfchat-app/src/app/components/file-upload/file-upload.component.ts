import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, finalize, switchMap } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CommunicationService } from 'src/app/services/communication.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {

  selectedFiles?: FileList;
  progressInfos: any[] = [];
  message: string[] = [];
  errorMsg: string[] = [];
  fileInfos?: Observable<any>;
  files: File[] = [];
  status: "initial" | "uploading" | "uploaded" | "fail" | "loadingChat" | "chatReady" = "initial";
  uploadProgress: { [key: string]: number } = {};
  uploadedDocuments: any[] = [];
  filteredDocuments: any[] = [];


  constructor(private apiService: ApiService, private commService: CommunicationService, private router: Router) { }

  ngOnInit(): void {
    this.getUploadedDocuments();
    this.fileInfos = this.apiService.getUploadedDocuments();
  }

  onChange(event: any) {
    this.message = [];
    this.progressInfos = [];
    this.selectedFiles = event.target.files;

    if (this.selectedFiles) {
      this.status = "uploading";
      for (let i = 0 ; i < this.selectedFiles.length ; i++) {
        const file = this.selectedFiles[i];
        this.progressInfos.push({ value: 0, filename: file.name });
      }
      /* this.files = Array.from(files); */
    }
    console.log('files: ', this.selectedFiles);
    console.log('status: ', this.status);
  }

  onUpload(idx: number, file: File): void {
    this.progressInfos[idx] = { value:0, filename: file.name };
    console.log('start uploading');
    if (file) {
      console.log('status: ', this.status);
      
      /* Array.from(this.files).forEach(file => {
        this.uploadProgress[file.name] = 0;
      }); */
      

      console.log('start calling uploadFiles endpoint');
      this.apiService.uploadFiles(file).subscribe({
        next: (event: any) => {
          console.log('event', event.type);
          console.log('event total: ', event.total);
          console.log('event loaded: ', event.loaded);
          if (event.type === HttpEventType.UploadProgress) {
            console.log('enter to progress bar');
            this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total);
            /* console.log('percent: ', percent);
            this.uploadProgress[event?.srcElement?.response as string] = percent; */

          } else if (event instanceof HttpResponse) {
            console.log('Response from backend: ', event.body);
            this.status = "uploaded";
            const msg = 'File Uploaded Successfully: ' + file.name;
            this.message.push(msg);
            this.fileInfos = this.apiService.getUploadedDocuments();
            console.log('uploaded documents: ', this.fileInfos);

            /* console.log('call endpoint continue execution');
            this.apiService.continueExecution().subscribe(() => {
              this.status = "loadingChat"
              console.log('status: ', this.status);
              console.log('call endpoint create embeddings');
              this.apiService.createEmbeddings().subscribe(() => {
                console.log('call endpoint llm model');
                this.apiService.llmModel().subscribe(() => {
                  console.log('call endpoint build chain');
                  this.apiService.buildChain().subscribe(() => {
                    this.status = "chatReady";
                    console.log('status: ', this.status);
                  }, error => {
                    console.error('Error building chain: ', error);
                    this.status = "fail";
                  });
                }, error => {
                  console.error('Error creating llm model: ', error);
                  this.status = "fail";
                });
              }, error => {
                console.error('Error creating embeddings: ', error);
                this.status = "fail";
              });
            }, error => {
              console.error('Error loading pdfs: ', error);
              this.status = "fail";
            }); */
          }
          
        },
        error: (err: any) => {
          console.error("Upload error: ", err);
          this.status = "fail";
          this.progressInfos[idx].value = 0;
          const msg = 'Could not upload the file' + file.name;
          this.errorMsg.push(msg);
          this.fileInfos = this.apiService.getUploadedDocuments();
        }
      });
    }
  }

  uploadFiles(): void {
    this.message = [];
    this.errorMsg = [];

    if (this.selectedFiles) {
      for (let i = 0 ; i < this.selectedFiles.length ; i++) {
        const file = this.selectedFiles[i];
        if (file.size === 0) {
          this.status = 'fail';
          const errorMessage = `File "${file.name}" is empty.`;
          this.errorMsg.push(errorMessage);
          return;
        } 
        console.log(`Uploading file: ${file.name}, Size: ${file.size} bytes`);
        this.onUpload(i, file);
      }
    } else {
      this.status = 'fail';
      this.errorMsg.push('No files selected.');
    }
  }

  buildLLM() {
    this.apiService.continueExecution().pipe(
      switchMap(() => {
        this.status = "loadingChat";
        console.log('status: ', this.status);
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
        this.status = "chatReady";
        console.log('status: ', this.status);
        console.log('Finalizing...');
      })
    ).subscribe(() => {
      console.log('Success!');
    }, error => {
      console.error('Error: ', error);
      this.status = "fail";
    }); 
  }

  startChat() {
    this.router.navigate(['/chat-documents']);
  }

  chatDocuments() {
    this.status = 'loadingChat';
    this.apiService.buildChain().subscribe(() => {
      console.log('start chat with documents');
      this.status = 'chatReady';
    }, error => {
      console.error('Error start chat with documents: ', error);
    });
  }

  dismissMsg(index: number): void {
    this.message.splice(index, 1);
  }

  dismissErrMsg(index: number): void {
    this.errorMsg.splice(index, 1);
  }

  getUploadedDocuments(): void {
    if(this.selectedFiles) {
      const filesArray = Array.from(this.selectedFiles);
      this.apiService.getUploadedDocuments().subscribe(
        response => {
          console.log('Response from server: ', response);
          this.uploadedDocuments = response.uploaded_documents;
          console.log('Uploaded documents: ', this.uploadedDocuments);
          this.filteredDocuments = this.uploadedDocuments.filter(document =>
            filesArray.some(selectedFile => selectedFile.name === document.name)
          );
        },
        error => {
          console.error('Error fetching uploaded documents: ', error);
        }
      ); 
    }
  }


}


