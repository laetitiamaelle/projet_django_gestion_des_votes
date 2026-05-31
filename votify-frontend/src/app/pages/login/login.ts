// ============================================================
// COMMANDE CLI : ng generate component pages/login --standalone --skip-tests
//
// RÔLE : Page de connexion avec design split-screen.
//        Gauche : panneau bleu Votify
//        Droite : formulaire de connexion
//        Pas d'appel API — juste le visuel.
// ============================================================

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  // ReactiveFormsModule est nécessaire pour utiliser
  // formGroup, formControlName dans le HTML
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {

  // signal() : variable réactive qui met à jour le DOM
  // automatiquement quand sa valeur change.
  // Ici utilisé pour afficher/masquer le mot de passe.
  afficherMotDePasse = signal(false);

  // Formulaire réactif : défini en TypeScript, pas dans le HTML
  // Chaque champ a ses règles de validation
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // fb.group() crée le formulaire avec ses champs
    this.loginForm = this.fb.group({
      // [valeur_initiale, [validateurs]]
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]  // Case à cocher, false par défaut
    });
  }

  // Raccourcis pour accéder aux champs depuis le HTML
  // Évite d'écrire loginForm.get('email') partout
  get email()    { return this.loginForm.get('email')!;    }
  get password() { return this.loginForm.get('password')!; }

  // Bascule l'affichage du mot de passe (texte ↔ points)
  toggleMotDePasse(): void {
    this.afficherMotDePasse.update(v => !v);
  }

  // Appelée quand le formulaire est soumis
  // Pour l'instant juste un log — le vrai appel API viendra plus tard
  onSubmit(): void {
    if (this.loginForm.invalid) {
      // Marquer tous les champs comme "touchés" pour afficher les erreurs
      this.loginForm.markAllAsTouched();
      return;
    }
    // TODO: Appel API Django ici plus tard
    console.log('Formulaire valide :', this.loginForm.value);
  }
}
