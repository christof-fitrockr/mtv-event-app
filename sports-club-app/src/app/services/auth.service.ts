import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, authState, User, updateProfile, updateEmail, sendPasswordResetEmail } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public readonly authState: Observable<User | null>;

  constructor(private auth: Auth) {
    this.authState = authState(auth);
  }

  async login(email: string, password: string): Promise<any> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(email: string, password: string): Promise<any> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    return signOut(this.auth);
  }

  async updateProfile(displayName: string, email: string): Promise<void> {
    if (this.auth.currentUser) {
      if (displayName !== this.auth.currentUser.displayName) {
        await updateProfile(this.auth.currentUser, { displayName });
      }
      if (email !== this.auth.currentUser.email) {
        await updateEmail(this.auth.currentUser, email);
      }
    }
  }

  async sendPasswordReset(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }
}
