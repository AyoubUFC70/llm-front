import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  /* private apiUrl = 'http://34.88.57.194'; */
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) { }

  importPackages(): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/import-packages', {});
  }

  uploadFiles(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    /* files.forEach((file) => {
      console.log('file :', file.name)
      formData.append('file', file);
    }); */

    formData.append('file', file);

    console.log('files: ', file);
    console.log('Envoi de la requête HTTP POST vers le backend avec les fichiers :', formData);
    console.log('formData', formData.get("file"));

    return this.http.post<any>(`${this.apiUrl}/upload`, formData, { reportProgress: true, observe: 'events' });
  }

  continueExecution(): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/continue-execution', {});
  }

  createEmbeddings(): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/create-embeddings', {});
  }

  llmModel(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/llm-model`, {});
  }

  buildChain(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/build-chain`, {});
  }

  startChat(userInput: string): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/start-chat', { user_input: userInput });
  }

  getUploadedDocuments(): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/uploaded-documents`);
  }

  deleteDocument(document: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-document`, { body: { name: document } });
  }
}
