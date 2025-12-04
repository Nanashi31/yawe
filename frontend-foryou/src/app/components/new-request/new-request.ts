import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // Import AuthService

@Component({
  selector: 'app-new-request',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './new-request.html',
  styleUrls: ['./new-request.css']
})
export class NewRequestComponent {
  currentStep = 1;
  requestForm: FormGroup;
  projectTypes = ['Puerta', 'Ventana', 'Portón', 'Barandal', 'Reja', 'Escalera', 'Otro'];

  // Placeholder for available dates - this would come from a service
  availableDates = [
    { day: 'lun', date: 9, available: true },
    { day: 'mar', date: 10, available: false },
    { day: 'mié', date: 11, available: true },
    { day: 'jue', date: 12, available: true },
    { day: 'vie', date: 13, available: false },
    { day: 'sáb', date: 14, available: true },
  ];

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService // Inject AuthService
  ) {
    this.requestForm = this.fb.group({
      details: this.fb.group({
        projectName: ['', Validators.required],
        projectType: ['', Validators.required],
        description: [''],
        dimensions: [''],
        estimatedBudget: [0]
      }),
      appointment: this.fb.group({
        date: [null, Validators.required],
        time: [null] // Can be added later
      })
    });
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      if (this.requestForm.get('details')?.invalid) {
        this.markFormGroupTouched(this.requestForm.get('details') as FormGroup);
        return;
      }
    }
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    } else {
      this.router.navigate(['/home']);
    }
  }
  
  selectProjectType(type: string): void {
    this.requestForm.get('details.projectType')?.setValue(type);
  }

  selectDate(date: any): void {
    if (date.available) {
      this.requestForm.get('appointment.date')?.setValue(date);
    }
  }

  submitRequest(): void {
    // --- Start of new diagnostic code ---
    console.log('--- Checking form validity ---');
    console.log('Form valid?', this.requestForm.valid);
    console.log('Form values:', this.requestForm.value);

    // Log individual control status
    Object.keys(this.requestForm.controls).forEach(groupKey => {
      const formGroup = this.requestForm.get(groupKey) as FormGroup;
      console.log(`--- FormGroup: ${groupKey} ---`);
      Object.keys(formGroup.controls).forEach(controlKey => {
        const control = formGroup.get(controlKey);
        console.log(`Control: ${groupKey}.${controlKey}, Status: ${control?.status}, Value:`, control?.value);
      });
    });
    console.log('--- End of validity check ---');
    // --- End of new diagnostic code ---

    if (this.requestForm.valid) {
      // Prepare data for the backend
      const details = this.detailsForm.value;
      const appointment = this.appointmentForm.value;

      const payload = {
        tipo_proyecto: details.projectType,
        descripcion: details.description,
        // The backend needs to know which user is making the request.
        // This is handled automatically by the auth:sanctum middleware.
        // We might need to adjust the backend controller to associate the request with the user.
        fecha_cita: appointment.date ? `${appointment.date.date}/12/2025` : null, // Example date formatting
        // The 'direccion' field is missing from the form, but required by the backend.
        // Let's add a placeholder for now.
        direccion: 'Placeholder Address'
      };

      this.authService.createRequest(payload).subscribe({
        next: (response) => {
          console.log('Request created successfully!', response);
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Error creating request:', error);
          // Handle error display
        }
      });
    } else {
      console.error('Form is invalid');
      this.markFormGroupTouched(this.requestForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters for easy access in the template
  get detailsForm(): FormGroup {
    return this.requestForm.get('details') as FormGroup;
  }

  get appointmentForm(): FormGroup {
    return this.requestForm.get('appointment') as FormGroup;
  }
}
