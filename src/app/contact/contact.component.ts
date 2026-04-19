import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '../core/services/contact.service';
import { ContactFormData } from '../core/models/contact.model';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);
  private readonly phonePattern = /^\+[1-9]\d{7,14}$/;

  isSubmitting = false;
  submissionMessage = '';
  submissionSuccess = false;

  contactForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(this.phonePattern)]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  submit(): void {
    if (this.contactForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.submissionMessage = '';
    const raw = this.contactForm.getRawValue();
    const formValue: ContactFormData = {
      name: raw.name.trim(),
      email: raw.email.trim(),
      phoneNumber: raw.phoneNumber.trim(),
      message: raw.message.trim()
    };

    this.contactService.submitContactForm(formValue).subscribe((response) => {
      this.submissionSuccess = response.success;
      this.submissionMessage = response.message;
      this.isSubmitting = false;
      if (response.success) {
        this.contactForm.reset();
      }
    });
  }
}
