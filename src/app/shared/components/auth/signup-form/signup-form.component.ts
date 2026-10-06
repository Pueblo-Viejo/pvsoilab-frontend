
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-signup-form',
  imports: [
    LabelComponent,
    CheckboxComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule
],
  templateUrl: './signup-form.component.html',
  styles: ``
})
export class SignupFormComponent {

  showPassword = false;
  isChecked = false;
  isSubmitting = false;
  errorMessage = '';

  fname = '';
  lname = '';
  username = '';
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignUp() {
    if (this.isSubmitting) {
      return;
    }

    this.errorMessage = '';

    const firstName = this.fname.trim();
    const name = `${firstName} ${this.lname.trim()}`.trim();
    const username = this.username.trim();
    const email = this.email.trim();

    if (!firstName || !username || !this.password) {
      this.errorMessage = 'Completa nombre, usuario y contrasena.';
      return;
    }

    if (!this.isChecked) {
      this.errorMessage = 'Debes aceptar los terminos y condiciones.';
      return;
    }

    this.isSubmitting = true;

    this.authService.register({ name, username, email, password: this.password }).subscribe({
      next: () => {
        this.router.navigateByUrl('/');
      },
      error: (message: string) => {
        this.errorMessage = message;
        this.isSubmitting = false;
      },
    });
  }
}
