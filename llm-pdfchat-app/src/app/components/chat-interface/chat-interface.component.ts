import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, switchMap } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CommunicationService } from 'src/app/services/communication.service';

interface Message {
  content: string;
  role: 'user' | 'assistant';
}

@Component({
  selector: 'app-chat-interface',
  templateUrl: './chat-interface.component.html',
  styleUrls: ['./chat-interface.component.scss']
})
export class ChatInterfaceComponent implements OnInit {
  userInputForm: FormGroup;
  messages: Message[] = [
    { content: "Can I help you ?", role: "assistant" },
    
  ]
  isTyping = false;
  isLoading: boolean = false;
  status: "initial" | "uploading" | "uploaded" | "fail" | "loadingChat" | "chatReady" = "initial";

  constructor(private apiService: ApiService, private commService: CommunicationService, private formBuilder: FormBuilder) {
    this.userInputForm = this.formBuilder.group({
      userInput: ['', Validators.required]
    })
  }

  ngOnInit(): void {
    this.commService.isLoading$.subscribe(isLoading => {
      this.isLoading = isLoading;
    })
  }

  handleEnterKey(event: any) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const userInputControl = this.userInputForm.get('userInput')
      userInputControl?.setValue(userInputControl.value + '\n');
    }
  }
  
  async handleSubmit() {
    console.log('butonn submit clicked');
    const userInputValue = this.userInputForm.value.userInput;
    if (!userInputValue.trim()) return;

    const newMessage: Message = { content: userInputValue, role: "user" }
    this.messages.push(newMessage);
    this.isTyping = true;
    this.userInputForm.get('userInput')?.setValue('');
    

    try {
      const response = await this.apiService.startChat(userInputValue).toPromise();
      console.log('response: ', response);
      this.messages.push({ content: response.response, role: "assistant" });
    } catch(error) {
      console.error('Error sending message: ', error);
      this.messages.push({ content: "An error occured. Please try again later.", role: "assistant" });
    } finally {
      this.isTyping = false;
      this.userInputForm.reset();
    }
  }

  onStartNewChat():void {
    this.messages = [];
  }

  


  /* startChat(): void {
    if (this.userInput.trim() !== '') {
      this.botResponse.push({
        sender: 'user',
        message: this.userInput
      });
      this.apiService.startChat(this.userInput).subscribe(
        response => {
          if (response.status === 'success') {
            this.botResponse.push({
              sender: 'model',
              message: response.response
            });
          } else {
            console.error('Error responding: ', response.error);
          }
        },
        error => {
          console.error('Error sending message: ', error);
        }
      );
    }
    this.userInput = '';
  } */

}
