import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppUser, AuthService } from '../../../../core/auth/auth.service';
import { UsuariosService } from '../../../usuarios/services/usuarios.service';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-page.html'
})
export class PerfilPage implements OnInit {
  currentUser: AppUser | null = null;
  formData: any = {};
  loading = false;
  success = false;
  errorMsg = '';
  editandoPassword = false;
  newPassword = '';

  constructor(
    private readonly auth: AuthService,
    private readonly usuarios: UsuariosService,
    private readonly location: Location
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.user;
    this.formData = {
      nombre: this.currentUser?.nombre || '',
      email: this.currentUser?.email || '',
      numero_documento: this.currentUser?.numero_documento || ''
    };
  }

  async guardarPerfil(): Promise<void> {
    if (!this.currentUser) return;
    if (!this.formData.nombre || !this.formData.email) {
      this.errorMsg = 'El nombre y correo son obligatorios.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    try {
      const datos = { ...this.formData };
      if (this.editandoPassword && this.newPassword) datos.password = this.newPassword;
      await this.usuarios.actualizarUsuario(this.currentUser.id, datos);
      this.auth.updateUser({ ...this.currentUser, ...this.formData });
      this.success = true;
      this.cancelarPassword();
      setTimeout(() => (this.success = false), 4000);
    } catch {
      this.errorMsg = 'Error al actualizar el perfil.';
    } finally {
      this.loading = false;
    }
  }

  cancelarPassword(): void {
    this.editandoPassword = false;
    this.newPassword = '';
  }

  volver(): void {
    this.location.back();
  }
}
