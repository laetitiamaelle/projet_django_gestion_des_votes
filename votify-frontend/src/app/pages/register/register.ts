// ============================================================
// COMMANDE CLI :
// ng generate component pages/register --standalone --skip-tests
//
// RÔLE : Page d'inscription pour les électeurs.
//        Design split-screen :
//        Gauche = fond clair avec argumentaire
//        Droite = formulaire de création de compte
//        Pas d'appel API — visuel uniquement.
// ============================================================

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

// Validateur personnalisé : vérifie que les deux mots de passe correspondent
function passwordsIdentiques(control: AbstractControl) {
  const mdp     = control.get('password');
  const confirm = control.get('passwordConfirm');
  // Si les valeurs ne correspondent pas → erreur 'nonIdentiques'
  if (mdp && confirm && mdp.value !== confirm.value) {
    confirm.setErrors({ nonIdentiques: true });
  }
  return null;
}

// Interface pour typer les arguments de la page gauche
interface Argument {
  icone: string;
  titre: string;
  description: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {

  // Contrôle la visibilité des mots de passe
  afficherMdp        = signal(false);
  afficherMdpConfirm = signal(false);

  // Arguments affichés sur le panneau gauche
  arguments: Argument[] = [
    {
      icone: 'bi-shield-check',
      titre: 'Sécurité de niveau bancaire',
      description: 'Vos votes sont chiffrés de bout en bout et protégés par les protocoles les plus stricts.'
    },
    {
      icone: 'bi-fingerprint',
      titre: 'Anonymat garanti',
      description: 'Le secret du vote est notre priorité absolue. Personne ne peut lier votre identité à votre choix.'
    },
    {
      icone: 'bi-lightning-charge',
      titre: 'Rapidité & Simplicité',
      description: 'Votez en quelques secondes depuis n\'importe quel appareil, sans déplacement inutile.'
    }
  ];

  // Formulaire réactif avec validateur personnalisé
  registerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      nom:            ['', Validators.required],
      email:          ['', [Validators.required, Validators.email]],
      telephone:      ['', Validators.required],
      password:       ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm:['', Validators.required],
      conditions:     [false, Validators.requiredTrue] // Doit être coché
    }, { validators: passwordsIdentiques }); // Validateur au niveau du groupe
  }

  // Raccourcis champs
  get nom()             { return this.registerForm.get('nom')!;             }
  get email()           { return this.registerForm.get('email')!;           }
  get telephone()       { return this.registerForm.get('telephone')!;       }
  get password()        { return this.registerForm.get('password')!;        }
  get passwordConfirm() { return this.registerForm.get('passwordConfirm')!; }
  get conditions()      { return this.registerForm.get('conditions')!;      }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    // TODO: Appel API Django plus tard
    console.log('Inscription :', this.registerForm.value);
  }
}
