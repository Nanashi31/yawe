import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  userName = 'Usuario';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener nombre del usuario actual
    const user = this.authService.currentUser();
    if (user) {
      this.userName = user.name;
    }
  }

  onNavigateToNotifications(): void {
    console.log('Navigate to notifications');
  }

  onNavigateToProfile(): void {
    console.log('Navigate to profile');
  }

  onNavigateToCreateRequest(): void {
    console.log('Navigate to create request');
  }

  onNavigateToProjects(): void {
    console.log('Navigate to projects');
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Aún así redirigir al login
        this.router.navigate(['/login']);
      }
    });
  }
}
