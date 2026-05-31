// ============================================================
// COMMANDE CLI :
// ng generate component pages/demande-admin --standalone --skip-tests
//
// RÔLE : Formulaire de demande de compte administrateur.
//        S'ouvre quand l'utilisateur clique sur
//        "Demander un compte administrateur" depuis l'accueil.
//        Pas d'appel API — visuel uniquement.
// ============================================================

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-demande-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './demande-admin.html',
  styleUrls: ['./demande-admin.scss']
})
export class DemandeAdminComponent {

  // Signal pour afficher un message de succès après envoi
  envoye = signal(false);

  // Formulaire réactif avec tous les champs de la maquette
  demandeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.demandeForm = this.fb.group({
      // Validators.required = champ obligatoire
      nom:          ['', Validators.required],
      email:        ['', [Validators.required, Validators.email]],
      telephone:    ['', Validators.required],
      cni:          ['', Validators.required],
      organisation: ['', Validators.required],
      motif:        ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  // Raccourcis pour accéder aux champs dans le HTML
  get nom()          { return this.demandeForm.get('nom')!;          }
  get email()        { return this.demandeForm.get('email')!;        }
  get telephone()    { return this.demandeForm.get('telephone')!;    }
  get cni()          { return this.demandeForm.get('cni')!;          }
  get organisation() { return this.demandeForm.get('organisation')!; }
  get motif()        { return this.demandeForm.get('motif')!;        }

  // Soumission du formulaire
  onSubmit(): void {
    if (this.demandeForm.invalid) {
      this.demandeForm.markAllAsTouched();
      return;
    }
    // TODO: Appel API Django plus tard
    // Pour l'instant on simule un envoi réussi
    console.log('Demande envoyée :', this.demandeForm.value);
    this.envoye.set(true);
  }

  // Réinitialiser le formulaire
  nouvelleDemandeq(): void {
    this.demandeForm.reset();
    this.envoye.set(false);
  }
}
