
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signin-form',
  imports: [
    LabelComponent,
    CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule
],
  templateUrl: './signin-form.component.html',
  styles: ``
})
export class SigninFormComponent {

  showPassword = false;
  isChecked = false;
  isSubmitting = false;
  errorMessage = '';

  username = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {
    if (this.isSubmitting) {
      return;
    }

    this.errorMessage = '';

    const username = this.username.trim();
    if (!username || !this.password) {
      this.errorMessage = 'Ingresa usuario y contrasena.';
      return;
    }

    this.isSubmitting = true;

    this.authService.login(username, this.password).subscribe({
      next: () => {
        this.router.navigateByUrl('/');
      },
      error: (message: string) => {
        this.errorMessage = message;
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
    });
  }
}
