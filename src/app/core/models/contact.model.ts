export interface ContactFormData {
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
}

export interface ContactSubmissionResponse {
  success: boolean;
  message: string;
}
