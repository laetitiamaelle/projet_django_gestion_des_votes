import { Routes } from '@angular/router';

export const routes: Routes = [
  // Page d'accueil
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home')
        .then(m => m.HomeComponent),
    title: 'Votify — Vote électronique sécurisé'
  },

  // Connexion
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login')
        .then(m => m.LoginComponent),
    title: 'Connexion — Votify'
  },

  // Inscription électeur
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register')
        .then(m => m.RegisterComponent),
    title: 'Créer un compte — Votify'
  },

  // Demande compte administrateur
  {
    path: 'demande-admin',
    loadComponent: () =>
      import('./pages/demande-admin/demande-admin')
        .then(m => m.DemandeAdminComponent),
    title: 'Demande administrateur — Votify'
  },

  // Dashboard superadmin
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard')
        .then(m => m.DashboardComponent),
    title: 'Tableau de bord Superadmin — Votify'
  },

  // Dashboard administrateur
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard')
        .then(m => m.AdminDashboardComponent),
    title: 'Tableau de bord Admin — Votify'
  },

  // Redirection par défaut
  { path: '**', redirectTo: '' }
];