import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';

interface DemoChat {
  id: string;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  gear: string;
}

interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
  attachment?: string;
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="messages-page">
      <div class="container">
        <div class="messages-box card-glass">
          <!-- Sidebar / Conversations List -->
          <div class="conv-sidebar">
            <div class="conv-header">
              <h2>Direct Messages</h2>
              <span class="badge badge-primary">2 Active</span>
            </div>

            <div class="conv-list">
              @for (chat of conversations; track chat.id) {
                <div
                  class="conv-item"
                  [class.active]="selectedChat().id === chat.id"
                  (click)="selectedChat.set(chat)">
                  <img [src]="chat.avatar" [alt]="chat.name" class="conv-avatar" />
                  <div class="conv-meta">
                    <div class="conv-top flex-between">
                      <strong>{{ chat.name }}</strong>
                      <span class="conv-time">{{ chat.time }}</span>
                    </div>
                    <p class="conv-preview">{{ chat.lastMsg }}</p>
                    <span class="conv-gear">📱 {{ chat.gear }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Main Chat Panel -->
          <div class="chat-main">
            <!-- Chat Header -->
            <div class="chat-header flex-between">
              <div class="chat-user-info">
                <img [src]="selectedChat().avatar" [alt]="selectedChat().name" class="chat-user-avatar" />
                <div>
                  <h3>{{ selectedChat().name }}</h3>
                  <span class="chat-gear-tag">📱 {{ selectedChat().gear }} • Active Now</span>
                </div>
              </div>
            </div>

            <!-- Messages Stream -->
            <div class="chat-body">
              @for (msg of messages; track msg.id) {
                <div class="msg-bubble-wrap" [class.my-msg]="msg.sender === 'me'">
                  <div class="msg-bubble">
                    <p>{{ msg.text }}</p>
                    <span class="msg-time">{{ msg.time }}</span>
                  </div>
                </div>
              }
            </div>

            <!-- Chat Input Footer -->
            <form (ngSubmit)="send()" class="chat-footer">
              <input
                type="text"
                [(ngModel)]="inputText"
                name="msg"
                placeholder="Type your message or project question..."
                class="chat-input"
              />
              <button type="submit" class="btn btn-primary btn-md">Send 🚀</button>
            </form>
          </div>
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }

    .messages-page {
      padding-top: calc(var(--navbar-height) + var(--space-6));
      padding-bottom: var(--space-12);
    }

    .messages-box {
      height: 75vh;
      min-height: 550px;
      display: grid;
      grid-template-columns: 320px 1fr;
      border-radius: var(--radius-2xl);
      overflow: hidden;
    }

    /* Sidebar */
    .conv-sidebar {
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      background: rgba(15, 23, 42, 0.4);
    }

    .conv-header {
      padding: var(--space-4) var(--space-5);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .conv-header h2 {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin: 0;
    }

    .conv-list {
      overflow-y: auto;
      flex-grow: 1;
    }

    .conv-item {
      display: flex;
      gap: var(--space-3);
      padding: var(--space-4);
      border-bottom: 1px solid var(--color-border-subtle);
      cursor: pointer;
      transition: background var(--transition-fast);
    }

    .conv-item:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    .conv-item.active {
      background: var(--color-primary-light);
      border-left: 3px solid var(--color-primary-500);
    }

    .conv-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }

    .conv-meta {
      flex-grow: 1;
      overflow: hidden;
    }

    .conv-top strong {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
    }

    .conv-time {
      font-size: 10px;
      color: var(--color-text-muted);
    }

    .conv-preview {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 2px 0 4px;
    }

    .conv-gear {
      font-size: 10px;
      color: var(--color-primary-400);
    }

    /* Main Chat */
    .chat-main {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .chat-header {
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--color-border);
      background: rgba(15, 23, 42, 0.3);
    }

    .chat-user-info {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .chat-user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--color-primary-500);
    }

    .chat-user-info h3 {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin: 0 0 2px;
    }

    .chat-gear-tag {
      font-size: 11px;
      color: var(--color-success);
    }

    .chat-body {
      flex-grow: 1;
      padding: var(--space-6);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .msg-bubble-wrap {
      display: flex;
      justify-content: flex-start;
    }

    .msg-bubble-wrap.my-msg {
      justify-content: flex-end;
    }

    .msg-bubble {
      max-width: 65%;
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--color-border);
    }

    .msg-bubble-wrap.my-msg .msg-bubble {
      background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700));
      border-color: transparent;
      color: #fff;
    }

    .msg-bubble p {
      margin: 0 0 4px;
      font-size: var(--font-size-sm);
      line-height: var(--line-height-normal);
    }

    .msg-time {
      font-size: 10px;
      opacity: 0.65;
      float: right;
    }

    .chat-footer {
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--color-border);
      display: flex;
      gap: var(--space-3);
      background: rgba(15, 23, 42, 0.5);
    }

    .chat-input {
      flex-grow: 1;
      padding: 0.75rem 1rem;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      outline: none;
    }

    @media (max-width: 768px) {
      .messages-box {
        grid-template-columns: 1fr;
      }
      .conv-sidebar {
        display: none;
      }
    }
  `]
})
export class MessagesComponent {
  auth = inject(AuthService);

  conversations: DemoChat[] = [
    {
      id: 'c-1',
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      lastMsg: 'The 4K ProRes files have been uploaded for review!',
      time: '11:45',
      unread: 1,
      gear: 'iPhone 16 Pro Max'
    },
    {
      id: 'c-2',
      name: 'Marc Dupont',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      lastMsg: 'Confirming Friday 19:00 for the bistro shoot.',
      time: 'Yesterday',
      unread: 0,
      gear: 'Galaxy S24 Ultra'
    }
  ];

  selectedChat = signal<DemoChat>(this.conversations[0]);
  inputText = '';

  messages: ChatMessage[] = [
    { id: 'm-1', sender: 'other', text: 'Hello! Thanks for reaching out regarding the mobile product video brief.', time: '11:15' },
    { id: 'm-2', sender: 'me', text: 'Hi! Can you confirm if you have a ring light and macro lens for texture shots?', time: '11:22' },
    { id: 'm-3', sender: 'other', text: 'Yes, absolutely! I use the iPhone 16 Pro 5x telephoto with an Aputure Amaran MC RGB light.', time: '11:30' },
    { id: 'm-4', sender: 'other', text: 'The 4K ProRes files have been uploaded for review!', time: '11:45' }
  ];

  send(): void {
    if (!this.inputText.trim()) return;

    this.messages.push({
      id: 'm-' + Date.now(),
      sender: 'me',
      text: this.inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    this.inputText = '';
  }
}
