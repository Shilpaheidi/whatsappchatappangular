// src/app/components/chat/chat.component.ts
import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  private socket!: Socket;
  username!: string;
  password!: string;
  receiver!: string;
  message!: string;
  messages: any[] = [];
  userData: any;
  email!: string;
  recentChats: any[] = [];
  userId!: number;
  receiverId: any;
  searchUsers!: string;

  constructor(private chatService: ChatService) {
    this.socket = io('http://localhost:3000', { // Change the port to match your NestJS server
      transports: ['websocket'],
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('message', (message: string) => {
      this.messages.push(message);
      console.log('messageArray', this.messages);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  ngOnInit(): void {
    const storedData = localStorage.getItem('user');
    this.userData = storedData ? JSON.parse(storedData) : null;
    console.log('storedData', storedData);

    this.email = this.userData.email;

    if (this.userData) {
      this.username = this.userData.username;
      this.password = this.userData.password;

      // this.loadMessages();

    }
    this.recentMessages();
  }

  sendMessage(): void {
    this.socket.emit('message', this.message, this.username, this.receiver);
    this.chatService.sendMessages(this.message, this.username, this.receiver).subscribe((res: any) => {
      this.messages = res;
      this.message = '';
      this.loadMessages(); // Refresh messages after sending
    });
  }

  loadMessages(): void {

    this.chatService.getUsersmessages(this.username, this.receiver).subscribe((res: any) => {

      console.log('loadMessages', res);

      this.messages = res;
    })
  }

  recentMessages() {
    this.chatService.getRecentMessages(this.email).subscribe((res: any) => {
      console.log('recentChats', res);


      this.recentChats = res;

    })
  }

  openChatRooms(chats: any, index: number) {
    console.log('openChatroom', chats, index);
    this.receiver = chats.sender_username;
    this.receiverId = chats.receiver_id;
    this.userId = chats.sender_id;
    this.loadMessages()
  }


  filterUsers() {
    this.chatService.filterRegisteredUsers(this.searchUsers).subscribe((res: any) => {
      console.log('filterUsers', res);
      this.recentChats.push(res[0]);
      console.log('filteredUsers2', this.recentChats[0]);


    })
  }
}
