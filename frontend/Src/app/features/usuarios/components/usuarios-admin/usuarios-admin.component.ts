import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';
import { AdminService } from '../../../admin/services/admin.service';

import { DataTableDirective } from '../../../../core/directives/data-table.directive';

@Component({
  selector: 'app-usuarios-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableDirective],
  templateUrl: './usuarios-admin.component.html'
})
export class UsuariosAdminComponent implements OnInit {
  usuarios: any[] = [];
  loadingUsuarios = false;
  usuarioForm!: FormGroup;
  mostrarModalUsuario = false;
  editandoUsuarioId: number | null = null;
  roles: any[] = [];
  programas: any[] = [];
  facultades: any[] = [];
  tiposDocumento: any[] = [];
  nivelesEducativos: any[] = [];

  mensajeExito = '';
  mensajeError = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly usuariosService: UsuariosService,
    private readonly adminService: AdminService
  ) {}

  ngOnInit() {
    this.initForm();
    this.cargarUsuarios();
  }

  initForm() {
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rol_id: [2, Validators.required],
      tipo_documento_id: [1, Validators.required],
      numero_documento: ['', Validators.required],
      facultad_id: [1, Validators.required],
      nivel_educativo_id: [null],
      programa_id: [null]
    });
  }

  async cargarUsuarios() {
    this.loadingUsuarios = true;
    try {
      const [usersRes, rolesRes, programasRes, facultadesRes, tiposDocRes, nivelesRes] = await Promise.all([
        this.usuariosService.obtenerUsuarios(),
        this.adminService.obtenerRoles(),
        this.usuariosService.obtenerProgramas(),
        this.usuariosService.obtenerFacultades(),
        this.usuariosService.obtenerTiposDocumento(),
        this.usuariosService.obtenerNivelesEducativos()
      ]);
      this.usuarios = usersRes.resultado || [];
      this.roles = rolesRes.resultado || [];
      this.programas = programasRes || [];
      this.facultades = facultadesRes || [];
      this.tiposDocumento = tiposDocRes || [];
      this.nivelesEducativos = nivelesRes || [];
    } catch (e) {
      console.error(e);
    } finally {
      this.loadingUsuarios = false;
    }
  }

  get programasFiltrados(): any[] {
    const facultadId = this.usuarioForm?.get('facultad_id')?.value;
    if (!facultadId) return this.programas;
    return this.programas.filter((p: any) => p.facultad_id === facultadId);
  }

  abrirModalUsuario(usuario?: any) {
    this.limpiarMensajes();
    if (usuario) {
      this.editandoUsuarioId = usuario.id;
      this.usuarioForm.patchValue({
        nombre: usuario.nombre,
        email: usuario.email || usuario.correo,
        password: '',
        rol_id: usuario.rol_id,
        tipo_documento_id: usuario.tipo_documento_id,
        numero_documento: usuario.numero_documento,
        facultad_id: usuario.facultad_id,
        nivel_educativo_id: usuario.nivel_educativo_id,
        programa_id: usuario.programa_id
      });
      this.usuarioForm.get('password')?.clearValidators();
      this.usuarioForm.get('password')?.updateValueAndValidity();
    } else {
      this.editandoUsuarioId = null;
      this.usuarioForm.reset({ rol_id: 2, tipo_documento_id: 1, facultad_id: 1 });
      this.usuarioForm.get('password')?.setValidators(Validators.required);
      this.usuarioForm.get('password')?.updateValueAndValidity();
    }
    this.mostrarModalUsuario = true;
  }

  cerrarModalUsuario() {
    this.mostrarModalUsuario = false;
    this.editandoUsuarioId = null;
    this.usuarioForm.reset();
  }

  async guardarUsuario() {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }
    try {
      const data = this.usuarioForm.value;
      if (this.editandoUsuarioId) {
        if (!data.password) delete data.password;
        await this.usuariosService.actualizarUsuario(this.editandoUsuarioId, data);
        this.mostrarExito('Usuario actualizado correctamente');
      } else {
        await this.usuariosService.crearUsuario(data);
        this.mostrarExito('Usuario creado correctamente');
      }
      this.cerrarModalUsuario();
      await this.cargarUsuarios();
    } catch (e: any) {
      this.mostrarError(e.message || 'Error al guardar usuario');
    }
  }

  async desactivarUsuario(id: number) {
    if (!confirm('¿Está seguro de desactivar este usuario?')) return;
    try {
      await this.usuariosService.eliminarUsuario(id);
      this.mostrarExito('Usuario desactivado correctamente');
      await this.cargarUsuarios();
    } catch (e: any) {
      this.mostrarError(e.message || 'Error al desactivar usuario');
    }
  }

  getNombreRol(rolId: number): string {
    const rol = this.roles.find((r: any) => r.id === rolId);
    return rol ? (rol.nombre_rol || rol.nombre) : 'N/A';
  }

  mostrarExito(msg: string) {
    this.mensajeExito = msg;
    this.mensajeError = '';
    setTimeout(() => this.mensajeExito = '', 4000);
  }

  mostrarError(msg: string) {
    this.mensajeError = msg;
    this.mensajeExito = '';
    setTimeout(() => this.mensajeError = '', 5000);
  }

  limpiarMensajes() {
    this.mensajeExito = '';
    this.mensajeError = '';
  }
}

