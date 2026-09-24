import {
  Component, inject, signal, computed, OnInit,
  AfterViewInit, OnDestroy, ViewChild, ElementRef, effect
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService, ConversationItem, ChatMsg } from '../../../core/services/message.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="messages-page">
      <div class="container">
        <div class="messages-box card-glass">

          <!-- ════════ SIDEBAR — Conversations List ════════ -->
          <div class="conv-sidebar" [class.mobile-hidden]="mobileShowChat()">
            <div class="conv-header">
              <div>
                <h2>Messages</h2>
                <span class="online-dot" [class.connected]="msgSvc.isConnected()">
                  {{ msgSvc.isConnected() ? '● En direct' : '○ Connexion...' }}
                </span>
              </div>
              @if (unreadTotal() > 0) {
                <span class="badge badge-primary">{{ unreadTotal() }} non lu(s)</span>
              }
            </div>

            <!-- Search bar -->
            <div class="conv-search-wrap">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Rechercher une conversation..."
                class="conv-search"
              />
            </div>

            <!-- Conversation Items -->
            <div class="conv-list">
              @if (msgSvc.isLoading() && conversations().length === 0) {
                <div class="conv-loading">
                  <span class="spinner">⏳</span>
                  <p>Chargement des conversations...</p>
                </div>
              }

              @for (conv of filteredConversations(); track conv.id) {
                <div
                  class="conv-item"
                  [class.active]="activeConv()?.id === conv.id"
                  (click)="openConversation(conv)"
                  role="button"
                  [attr.aria-label]="'Ouvrir la conversation avec ' + conv.otherUserName"
                >
                  <div class="conv-avatar-wrap">
                    @if (getConvAvatar(conv)) {
                      <img
                        [src]="getConvAvatar(conv)"
                        [alt]="conv.otherUserName"
                        class="conv-avatar"
                        referrerpolicy="no-referrer"
                      />
                    } @else {
                      <div class="conv-avatar-placeholder">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                    }
                    <span class="online-status"></span>
                  </div>
                  <div class="conv-meta">
                    <div class="conv-top">
                      <strong>{{ conv.otherUserName }}</strong>
                      <span class="conv-time">{{ formatTime(conv.lastMessageAt) }}</span>
                    </div>
                    <p class="conv-preview">{{ conv.lastMessage || 'Aucun message pour l\\'instant' }}</p>
                    @if (conv.unreadCount > 0) {
                      <span class="unread-badge">{{ conv.unreadCount }}</span>
                    }
                  </div>
                </div>
              }

              @if (filteredConversations().length === 0 && !msgSvc.isLoading()) {
                <div class="conv-empty">
                  <span class="empty-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </span>
                  <p>Aucune conversation pour l'instant</p>
                  <small>Démarrez un échange depuis le profil d'un créateur</small>
                </div>
              }
            </div>
          </div>

          <!-- ════════ MAIN CHAT PANEL ════════ -->
          <div class="chat-main" [class.mobile-show]="mobileShowChat()">

            @if (!activeConv()) {
              <!-- Empty state -->
              <div class="chat-empty">
                <div class="chat-empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <h3>Sélectionnez une conversation</h3>
                <p>Choisissez une conversation dans la liste pour échanger en direct</p>
                @if (!msgSvc.isConnected()) {
                  <div class="ws-status-badge connecting">
                    <svg class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                      <line x1="12" y1="2" x2="12" y2="6"></line>
                      <line x1="12" y1="18" x2="12" y2="22"></line>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                      <line x1="2" y1="12" x2="6" y2="12"></line>
                      <line x1="18" y1="12" x2="22" y2="12"></line>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                    <span>Connexion au serveur temps réel...</span>
                  </div>
                }
              </div>
            } @else {

              <!-- Chat Header -->
              <div class="chat-header">
                <button class="mobile-back" (click)="mobileShowChat.set(false)">← Retour</button>
                <div class="chat-user-info">
                  <a [routerLink]="getOtherUserProfileLink()" class="chat-user-avatar-link" title="Voir le profil">
                    @if (activeConv() && getConvAvatar(activeConv()!)) {
                      <img
                        [src]="getConvAvatar(activeConv()!)"
                        [alt]="activeConv()!.otherUserName"
                        class="chat-user-avatar"
                        referrerpolicy="no-referrer"
                      />
                    } @else {
                      <div class="chat-user-avatar-placeholder">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                    }
                  </a>
                  <div>
                    <a [routerLink]="getOtherUserProfileLink()" class="chat-user-name-link" title="Voir le profil">
                      <h3>{{ activeConv()!.otherUserName }}</h3>
                    </a>
                    <span class="chat-status">
                      @if (isTyping()) {
                        <span class="typing-text">est en train d'écrire<span class="dots">...</span></span>
                      } @else {
                        <span class="online-indicator">● En ligne</span>
                      }
                    </span>
                  </div>
                </div>
                <div class="chat-header-actions">
                  @if (msgSvc.isConnected()) {
                    <span class="ws-live-badge">● En direct</span>
                  } @else {
                    <span class="ws-offline-badge">Reconnexion...</span>
                  }
                </div>
              </div>

              <!-- Messages Stream -->
              <div class="chat-body" #chatBody id="chat-body-scroll">
                @if (msgSvc.isLoading()) {
                  <div class="msgs-loading">
                    <span>Chargement des messages...</span>
                  </div>
                }

                @for (msg of chatMessages(); track msg.id ?? msg.sentAt) {
                  <div class="msg-group" [class.mine]="isMine(msg)">
                    @if (!isMine(msg)) {
                      @if (getMsgAvatar(msg)) {
                        <img
                          [src]="getMsgAvatar(msg)"
                          [alt]="msg.senderName"
                          class="msg-avatar"
                          referrerpolicy="no-referrer"
                        />
                      } @else {
                        <div class="msg-avatar-placeholder">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                      }
                    }
                    <div class="msg-content-wrap">
                      @if (!isMine(msg)) {
                        <span class="msg-sender-name">{{ msg.senderName }}</span>
                      }
                      <div class="msg-bubble" [class.mine-bubble]="isMine(msg)">
                        <p>{{ msg.content }}</p>
                        <div class="msg-meta">
                          <span class="msg-time">{{ formatTime(msg.sentAt) }}</span>
                          @if (isMine(msg)) {
                            <span class="msg-read-status">{{ msg.isRead ? '✓✓' : '✓' }}</span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <!-- Typing indicator bubble -->
                @if (isTyping()) {
                  <div class="msg-group">
                    @if (activeConv() && getConvAvatar(activeConv()!)) {
                      <img [src]="getConvAvatar(activeConv()!)" class="msg-avatar" alt="typing" referrerpolicy="no-referrer" />
                    } @else {
                      <div class="msg-avatar-placeholder">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                    }
                    <div class="msg-content-wrap">
                      <span class="msg-sender-name">{{ typingInfo()?.senderName || activeConv()!.otherUserName }}</span>
                      <div class="msg-bubble typing-bubble">
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Chat Input Footer -->
              <form (ngSubmit)="sendMessage()" class="chat-footer" id="chat-input-form">
                <div class="chat-input-wrap">
                  <input
                    type="text"
                    [(ngModel)]="inputText"
                    name="msg"
                    placeholder="Écrivez votre message..."
                    class="chat-input"
                    id="message-input"
                    (input)="onTyping()"
                    (keydown.enter)="sendMessage(); $event.preventDefault()"
                    autocomplete="off"
                  />
                  <button
                    type="submit"
                    class="send-btn"
                    [disabled]="!inputText.trim()"
                    id="send-message-btn"
                    aria-label="Envoyer le message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/>
                    </svg>
                  </button>
                </div>
                @if (!msgSvc.isConnected()) {
                  <p class="offline-warning">Reconnexion au serveur temps réel en cours...</p>
                }
              </form>

            }
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
      min-height: 100vh;
    }

    /* ── Layout ─────────────────────────────────────────── */
    .messages-box {
      height: 78vh;
      min-height: 560px;
      display: grid;
      grid-template-columns: 320px 1fr;
      border-radius: var(--radius-2xl);
      overflow: hidden;
      border: 1px solid var(--color-border);
    }

    /* ── Sidebar ─────────────────────────────────────────── */
    .conv-sidebar {
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      background: rgba(10, 15, 30, 0.5);
      min-height: 0;
      overflow: hidden;
    }

    .conv-header {
      padding: var(--space-4) var(--space-5);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .conv-header h2 {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      margin: 0 0 2px;
    }

    .online-dot {
      font-size: 10px;
      color: var(--color-text-muted);
    }

    .online-dot.connected {
      color: var(--color-success);
    }

    .conv-search-wrap {
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--color-border-subtle);
    }

    .conv-search {
      width: 100%;
      padding: var(--space-2) var(--space-3);
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
      outline: none;
      box-sizing: border-box;
    }

    .conv-search:focus {
      border-color: var(--color-primary-400);
    }

    .conv-list {
      overflow-y: auto;
      flex-grow: 1;
      min-height: 0;
    }

    .conv-loading, .conv-empty {
      padding: var(--space-8) var(--space-4);
      text-align: center;
      color: var(--color-text-muted);
    }

    .conv-empty .empty-icon {
      font-size: 2rem;
      display: block;
      margin-bottom: var(--space-2);
    }

    .conv-empty p {
      font-size: var(--font-size-sm);
      margin: 0 0 var(--space-1);
    }

    .conv-empty small {
      font-size: var(--font-size-xs);
    }

    .conv-item {
      display: flex;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid rgba(255,255,255,0.04);
      cursor: pointer;
      transition: background var(--transition-fast);
      position: relative;
    }

    .conv-item:hover {
      background: rgba(255,255,255,0.03);
    }

    .conv-item.active {
      background: rgba(139, 92, 246, 0.1);
      border-left: 3px solid var(--color-primary-500);
    }

    .conv-avatar-wrap {
      position: relative;
      flex-shrink: 0;
    }

    .conv-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
    }

    .conv-avatar-placeholder {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.15));
      border: 1px solid rgba(139, 92, 246, 0.35);
      color: #c4b5fd;
    }

    .chat-user-avatar-placeholder {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.15));
      border: 2px solid var(--color-primary-500);
      color: #c4b5fd;
    }

    .msg-avatar-placeholder {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.15));
      border: 1px solid rgba(139, 92, 246, 0.35);
      color: #c4b5fd;
      flex-shrink: 0;
      margin-bottom: 2px;
    }

    .online-status {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 10px;
      height: 10px;
      background: var(--color-success);
      border-radius: 50%;
      border: 2px solid var(--color-bg-primary, #0a0f1e);
    }

    .conv-meta {
      flex-grow: 1;
      overflow: hidden;
      min-width: 0;
    }

    .conv-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2px;
    }

    .conv-top strong {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .conv-time {
      font-size: 10px;
      color: var(--color-text-muted);
      flex-shrink: 0;
      margin-left: var(--space-2);
    }

    .conv-preview {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
    }

    .unread-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      background: var(--color-primary-500);
      color: #fff;
      border-radius: 9px;
      font-size: 10px;
      font-weight: var(--font-weight-bold);
      margin-top: 4px;
    }

    /* ── Main Chat ─────────────────────────────────────────── */
    .chat-main {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      min-width: 0;
      overflow: hidden;
    }

    .chat-empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      color: var(--color-text-muted);
      padding: var(--space-8);
      text-align: center;
    }

    .chat-empty-icon {
      font-size: 3rem;
      opacity: 0.5;
    }

    .chat-empty h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      margin: 0;
    }

    .chat-empty p {
      font-size: var(--font-size-sm);
      max-width: 280px;
    }

    .ws-status-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
    }

    .ws-status-badge.connecting {
      background: rgba(234, 179, 8, 0.1);
      color: #fbbf24;
      border: 1px solid rgba(234, 179, 8, 0.3);
    }

    .chat-header {
      padding: var(--space-4) var(--space-5);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      gap: var(--space-3);
      background: rgba(10, 15, 30, 0.4);
      flex-shrink: 0;
    }

    .mobile-back {
      display: none;
      background: none;
      border: none;
      color: var(--color-primary-400);
      cursor: pointer;
      font-size: var(--font-size-sm);
      padding: 0;
    }

    .chat-user-info {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex: 1;
    }

    .chat-user-avatar-link {
      display: inline-block;
      text-decoration: none;
      cursor: pointer;
      transition: transform var(--transition-fast);
      flex-shrink: 0;
    }

    .chat-user-avatar-link:hover {
      transform: scale(1.08);
    }

    .chat-user-name-link {
      text-decoration: none;
      color: inherit;
      display: inline-block;
      cursor: pointer;
    }

    .chat-user-name-link:hover h3 {
      color: var(--color-primary-300);
      text-decoration: underline;
      text-underline-offset: 3px;
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

    .chat-status {
      font-size: 12px;
      color: var(--color-text-muted);
    }

    .typing-text {
      color: var(--color-primary-400);
      font-style: italic;
    }

    .online-indicator {
      color: var(--color-success);
    }

    .ws-live-badge {
      font-size: 11px;
      background: rgba(16, 185, 129, 0.1);
      color: var(--color-success);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }

    .ws-offline-badge {
      font-size: 11px;
      background: rgba(234, 179, 8, 0.1);
      color: #fbbf24;
      border: 1px solid rgba(234, 179, 8, 0.3);
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }

    /* ── Messages Body ─────────────────────────────────────── */
    .chat-body {
      flex: 1 1 0%;
      min-height: 0;
      overflow-y: auto;
      padding: var(--space-5) var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      scroll-behavior: smooth;
    }

    .msgs-loading {
      text-align: center;
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      padding: var(--space-4);
    }

    .msg-group {
      display: flex;
      align-items: flex-end;
      gap: var(--space-2);
      animation: slideIn 0.2s ease-out;
    }

    .msg-group.mine {
      flex-direction: row-reverse;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .msg-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      margin-bottom: 2px;
    }

    .msg-content-wrap {
      display: flex;
      flex-direction: column;
      max-width: 65%;
    }

    .msg-group.mine .msg-content-wrap {
      align-items: flex-end;
    }

    .msg-sender-name {
      font-size: 11px;
      color: var(--color-text-muted);
      margin-bottom: 3px;
      padding-left: var(--space-2);
    }

    .msg-bubble {
      padding: var(--space-3) var(--space-4);
      border-radius: 18px;
      border-bottom-left-radius: 4px;
      background: rgba(255,255,255,0.06);
      border: 1px solid var(--color-border);
    }

    .msg-bubble.mine-bubble {
      background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700));
      border-color: transparent;
      border-bottom-left-radius: 18px;
      border-bottom-right-radius: 4px;
    }

    .msg-bubble p {
      margin: 0 0 4px;
      font-size: var(--font-size-sm);
      line-height: 1.5;
      word-break: break-word;
    }

    .msg-meta {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--space-1);
    }

    .msg-time {
      font-size: 10px;
      opacity: 0.6;
    }

    .msg-read-status {
      font-size: 11px;
      opacity: 0.8;
      color: #93c5fd;
    }

    /* Typing bubble animation */
    .typing-bubble {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 12px 16px;
      border-radius: 18px;
      border-bottom-left-radius: 4px;
    }

    .typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-text-muted);
      animation: typingPulse 1.4s infinite ease-in-out;
    }

    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typingPulse {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30%            { transform: translateY(-6px); opacity: 1; }
    }

    /* ── Chat Input Footer ─────────────────────────────────── */
    .chat-footer {
      padding: var(--space-4) var(--space-5);
      border-top: 1px solid var(--color-border);
      background: rgba(10, 15, 30, 0.5);
      flex-shrink: 0;
    }

    .chat-input-wrap {
      display: flex;
      gap: var(--space-3);
      align-items: center;
    }

    .chat-input {
      flex-grow: 1;
      padding: 0.75rem 1.1rem;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--color-border);
      border-radius: 24px;
      color: var(--color-text-primary);
      outline: none;
      font-size: var(--font-size-sm);
      transition: border-color var(--transition-fast);
    }

    .chat-input:focus {
      border-color: var(--color-primary-400);
    }

    .chat-input::placeholder {
      color: var(--color-text-muted);
    }

    .send-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
      border: none;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity var(--transition-fast), transform var(--transition-fast);
    }

    .send-btn:hover:not(:disabled) {
      opacity: 0.9;
      transform: scale(1.05);
    }

    .send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .offline-warning {
      font-size: var(--font-size-xs);
      color: #fbbf24;
      margin: var(--space-2) 0 0;
      text-align: center;
    }

    /* ── Mobile ─────────────────────────────────────────────── */
    @media (max-width: 768px) {
      .messages-box {
        grid-template-columns: 1fr;
        height: calc(100vh - var(--navbar-height) - 2rem);
      }

      .conv-sidebar.mobile-hidden {
        display: none;
      }

      .chat-main {
        display: none;
      }

      .chat-main.mobile-show {
        display: flex;
      }

      .mobile-back {
        display: block;
      }
    }
  `]
})
export class MessagesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chatBody') private chatBodyRef!: ElementRef<HTMLDivElement>;

  readonly auth    = inject(AuthService);
  readonly msgSvc  = inject(MessageService);
  readonly route   = inject(ActivatedRoute);
  readonly router  = inject(Router);

  // ── State ─────────────────────────────────────────────────────────
  readonly conversations = this.msgSvc.conversations;
  readonly chatMessages  = this.msgSvc.messages;
  activeConv             = signal<ConversationItem | null>(null);
  mobileShowChat         = signal(false);
  inputText              = '';
  searchQuery            = '';

  readonly unreadTotal = computed(() =>
    this.conversations().reduce((sum, c) => sum + c.unreadCount, 0)
  );

  readonly filteredConversations = computed(() => {
    if (!this.searchQuery.trim()) return this.conversations();
    const q = this.searchQuery.toLowerCase();
    return this.conversations().filter(c =>
      c.otherUserName.toLowerCase().includes(q) ||
      (c.lastMessage ?? '').toLowerCase().includes(q)
    );
  });

  readonly isTyping = computed(() => {
    const conv = this.activeConv();
    if (!conv) return false;
    const typing = this.msgSvc.typingUsers().get(conv.id);
    if (!typing) return false;
    const curr = this.auth.currentUser();
    if (curr && String(curr.id).trim() === String(typing.senderId).trim()) return false;
    return true;
  });

  readonly typingInfo = computed(() => {
    const conv = this.activeConv();
    if (!conv) return null;
    const typing = this.msgSvc.typingUsers().get(conv.id);
    if (!typing) return null;
    const curr = this.auth.currentUser();
    if (curr && String(curr.id).trim() === String(typing.senderId).trim()) return null;
    return typing;
  });

  getConvAvatar(conv: ConversationItem | null | undefined): string {
    if (!conv) return '';

    // 1. If other user is current logged in user (self-test edge case)
    const curr = this.auth.currentUser();
    if (curr && (String(curr.id) === String(conv.otherUserId) || (curr.email && curr.email.toLowerCase() === (conv.otherUserName || '').toLowerCase()))) {
      const dedicated = this.auth.getDedicatedAvatar(curr.id, curr.email);
      if (dedicated) return dedicated;
      const cleanCurr = this.auth.cleanAvatar(curr.avatarUrl);
      if (cleanCurr) return cleanCurr;
    }

    // 2. Check dedicated avatar in storage for the other user ID
    if (conv.otherUserId) {
      const dedicated = this.auth.getDedicatedAvatar(conv.otherUserId);
      if (dedicated) return dedicated;
    }

    // 3. Check custom creator cached profile in localStorage
    if (conv.otherUserId) {
      try {
        const raw = localStorage.getItem(`snapconnect_creator_profile_${conv.otherUserId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          const cleaned = this.auth.cleanAvatar(parsed?.avatarUrl);
          if (cleaned) return cleaned;
        }
      } catch {}
    }

    // 4. Clean avatar provided by backend or queryParams (stripping any Unsplash placeholders)
    const cleanOther = this.auth.cleanAvatar(conv.otherUserAvatar);
    if (cleanOther) return cleanOther;

    return '';
  }

  getMsgAvatar(msg: ChatMsg | null | undefined): string {
    if (!msg) return '';

    // 1. If sender is current user
    const curr = this.auth.currentUser();
    if (curr && String(curr.id) === String(msg.senderId)) {
      const dedicated = this.auth.getDedicatedAvatar(curr.id, curr.email);
      if (dedicated) return dedicated;
      const cleanCurr = this.auth.cleanAvatar(curr.avatarUrl);
      if (cleanCurr) return cleanCurr;
    }

    // 2. Check dedicated avatar for sender ID
    if (msg.senderId) {
      const dedicated = this.auth.getDedicatedAvatar(msg.senderId);
      if (dedicated) return dedicated;

      try {
        const raw = localStorage.getItem(`snapconnect_creator_profile_${msg.senderId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          const cleaned = this.auth.cleanAvatar(parsed?.avatarUrl);
          if (cleaned) return cleaned;
        }
      } catch {}
    }

    // 3. Clean avatar provided in message payload
    const cleanMsg = this.auth.cleanAvatar(msg.senderAvatar);
    if (cleanMsg) return cleanMsg;

    return '';
  }

  getOtherUserProfileLink(): any[] {
    const conv = this.activeConv();
    if (!conv) return ['/'];
    if (this.auth.isClient()) {
      // Client chatting with creator
      const name = (conv.otherUserName || '').toLowerCase();
      if (name.includes('sarah')) return ['/creators', 'cr-1'];
      if (name.includes('mehdi')) return ['/creators', 'cr-2'];
      if (name.includes('yassine')) return ['/creators', 'cr-3'];
      if (name.includes('khalil')) return ['/creators', 'cr-4'];
      if (name.includes('mariem')) return ['/creators', 'cr-5'];
      if (name.includes('aziz')) return ['/creators', 'cr-6'];
      return ['/creators', conv.otherUserId || 'cr-1'];
    } else {
      // Creator chatting with client
      return ['/client/profile'];
    }
  }

  // Typing debounce & pending route params
  private typingTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingParams: any = null;
  private isProcessingPending = false;

  // ── Lifecycle ─────────────────────────────────────────────────────

  constructor() {
    // Auto-scroll on new messages
    effect(() => {
      const msgs = this.chatMessages();
      if (msgs.length > 0) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  ngOnInit(): void {
    // Read route query params (e.g. ?creatorId=... or ?convId=...)
    this.route.queryParams.subscribe(params => {
      if (params && (params['creatorId'] || params['creatorName'] || params['creatorEmail'] || params['convId'])) {
        this.pendingParams = params;
        this.processPendingParams();
      }
    });
  }

  ngAfterViewInit(): void {
    // Connect to WebSocket
    this.msgSvc.connect(() => {
      this.loadConversations();
    });

    // Also load conversations via REST immediately
    this.loadConversations();
  }

  ngOnDestroy(): void {
    this.msgSvc.disconnect();
    if (this.typingTimer) clearTimeout(this.typingTimer);
  }

  // ── Conversation Management ───────────────────────────────────────

  private loadConversations(): void {
    this.msgSvc.getConversations().subscribe({
      next: () => {
        this.processPendingParams();
      },
      error: (err) => {
        if (err.status !== 401) {
          console.warn('[Messages] Could not load conversations:', err.message);
        }
      }
    });
  }

  private processPendingParams(): void {
    if (!this.pendingParams || this.isProcessingPending) return;
    const params = this.pendingParams;

    // Direct conversation ID
    if (params['convId']) {
      const convId = Number(params['convId']);
      const found = this.conversations().find(c => c.id === convId);
      if (found) {
        this.openConversation(found);
        this.pendingParams = null;
        this.clearQueryParams();
        return;
      }
    }

    const targetId = params['creatorId'] && !isNaN(Number(params['creatorId'])) ? Number(params['creatorId']) : null;
    const targetName = params['creatorName'] ? String(params['creatorName']).trim().toLowerCase() : '';
    const targetEmail = params['creatorEmail'] ? String(params['creatorEmail']).trim().toLowerCase() : '';

    // Check if conversation already exists in loaded conversations
    const existing = this.conversations().find(c => {
      if (targetId && c.otherUserId === targetId) return true;
      if (targetName && c.otherUserName && c.otherUserName.toLowerCase() === targetName) return true;
      return false;
    });

    if (existing) {
      this.openConversation(existing);
      this.pendingParams = null;
      this.clearQueryParams();
      setTimeout(() => this.focusInput(), 150);
      return;
    }

    // If conversation doesn't exist yet and we have target creator info, create it automatically
    if (targetId || targetName || targetEmail) {
      this.isProcessingPending = true;
      this.msgSvc.startConversation({
        otherUserId: targetId,
        otherUserEmail: params['creatorEmail'] || undefined,
        otherUserName: params['creatorName'] || undefined,
        otherUserAvatar: params['creatorAvatar'] || undefined,
        contextType: params['contextType'] || 'CREATOR_PROFILE',
        contextId: params['contextId'] || undefined,
        contextTitle: params['contextTitle'] || undefined
      }).subscribe({
        next: (newConv) => {
          this.isProcessingPending = false;
          this.pendingParams = null;
          this.openConversation(newConv);
          this.clearQueryParams();
          setTimeout(() => this.focusInput(), 150);
        },
        error: (err) => {
          this.isProcessingPending = false;
          console.error('[Messages] Failed to automatically create conversation:', err);
        }
      });
    }
  }

  private clearQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  private focusInput(): void {
    try {
      const inputEl = document.getElementById('message-input') as HTMLInputElement;
      if (inputEl) {
        inputEl.focus();
      }
    } catch {}
  }

  openConversation(conv: ConversationItem): void {
    this.activeConv.set(conv);
    this.mobileShowChat.set(true);
    this.msgSvc.messages.set([]);

    // Subscribe to real-time topic for this conversation
    this.msgSvc.subscribeToConversation(conv.id);

    // Load history via REST
    this.msgSvc.getMessages(conv.id).subscribe({
      next: () => {
        setTimeout(() => this.scrollToBottom(), 100);
        // Send read receipt
        const user = this.auth.currentUser();
        if (user) this.msgSvc.sendReadReceipt(conv.id, user.id as any);
        // Reset unread count for this conversation
        this.conversations.update(convs =>
          convs.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c)
        );
      },
      error: (err) => {
        if (err.status !== 401) {
          console.warn('[Messages] Could not load messages:', err.message);
        }
      }
    });
  }

  // ── Messaging ─────────────────────────────────────────────────────

  sendMessage(): void {
    const conv    = this.activeConv();
    const user    = this.auth.currentUser();
    const content = this.inputText.trim();

    if (!conv || !user || !content) return;

    this.inputText = '';

    // Stop typing indicator
    const senderName = user.fullName?.trim() || user.email?.split('@')[0] || 'Utilisateur';
    this.msgSvc.sendTyping(conv.id, user.id as any, senderName, false);
    if (this.typingTimer) clearTimeout(this.typingTimer);

    // Send via REST (guaranteed DB persistence in MySQL + STOMP broadcast)
    this.msgSvc.sendChatMessage(conv.id, content).subscribe({
      next: () => {
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: (err) => {
        console.warn('[Messages] REST send failed, falling back to STOMP:', err);
        this.msgSvc.sendMessage(conv.id, user.id as any, content);
      }
    });
  }

  onTyping(): void {
    const conv = this.activeConv();
    const user = this.auth.currentUser();
    if (!conv || !user) return;

    // Send typing indicator
    const senderName = user.fullName?.trim() || user.email?.split('@')[0] || 'Utilisateur';
    this.msgSvc.sendTyping(conv.id, user.id as any, senderName, true);

    // Auto-stop after 2.5 seconds of inactivity
    if (this.typingTimer) clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.msgSvc.sendTyping(conv.id, user.id as any, senderName, false);
    }, 2500);
  }

  // ── Helpers ───────────────────────────────────────────────────────

  isMine(msg: ChatMsg): boolean {
    const user = this.auth.currentUser();
    return user ? (user.id as any) === msg.senderId || String(user.id) === String(msg.senderId) : false;
  }

  formatTime(dateStr: string | null): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now  = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / 86400000);

      if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (days === 1) return 'Hier';
      if (days < 7)  return date.toLocaleDateString([], { weekday: 'short' });
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch { return ''; }
  }

  private scrollToBottom(): void {
    try {
      const el = this.chatBodyRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch { /* ignore */ }
  }
}
