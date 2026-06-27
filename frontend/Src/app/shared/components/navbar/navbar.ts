import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppUser, AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {
  user: AppUser | null = null;
  role = '';
  private readonly subscriptions = new Subscription();

  constructor(public readonly auth: AuthService) {}

  ngOnInit(): void {
    this.subscriptions.add(this.auth.user$.subscribe((user) => (this.user = user)));
    this.subscriptions.add(this.auth.role$.subscribe((role) => (this.role = role)));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get homeLink(): string {
    return this.role === 'admin' ? '/admin' : this.role === 'entrenador' ? '/entrenador' : '/estudiante';
  }
}
