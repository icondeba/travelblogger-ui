export interface LoadState<T> {
  status: 'loading' | 'error' | 'success';
  data?: T;
  error?: string;
}
