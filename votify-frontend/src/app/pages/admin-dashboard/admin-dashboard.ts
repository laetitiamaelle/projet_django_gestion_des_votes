// ============================================================
// COMMANDE CLI :
// ng generate component pages/admin-dashboard --standalone --skip-tests
//
// RÔLE : Dashboard d'un administrateur (pas superadmin).
//        Affiche ses scrutins, ses statistiques personnelles
//        et permet de gérer ses élections.
//        Données fictives — pas d'appel API.
// ============================================================

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Statut possible d'un scrutin
type StatutScrutin = 'en_cours' | 'planifie' | 'termine' | 'brouillon';

// Interface pour une carte scrutin
interface Scrutin {
  id: number;
  titre: string;
  dateFin: string;
  statut: StatutScrutin;
  participation: number;       // Pourcentage (0-100)
  votesExprimes: number;
  totalElecteurs: number;
}

// Interface pour les cartes stat
interface StatCard {
  titre: string;
  valeur: string;
  variation?: string;
  variationPositive?: boolean;
  sousTitre: string;
  icone: string;
}

// Interface pour les liens de la sidebar
interface NavItem {
  label: string;
  icone: string;
  route: string;
  actif: boolean;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboardComponent {

  // Onglet actif
  ongletActif = 'dashboard';

  // ── Navigation sidebar ────────────────────────────────
  navItems: NavItem[] = [
    { label: 'Tableau de bord', icone: 'bi-grid-1x2-fill',   route: 'dashboard',   actif: true  },
    { label: 'Mes scrutins',    icone: 'bi-clipboard2-check', route: 'scrutins',    actif: false },
    { label: 'Candidats',       icone: 'bi-people',           route: 'candidats',   actif: false },
    { label: 'Inscriptions',    icone: 'bi-person-plus',      route: 'inscriptions',actif: false },
    { label: 'Résultats',       icone: 'bi-bar-chart-line',   route: 'resultats',   actif: false },
    { label: 'Profil',          icone: 'bi-person-circle',    route: 'profil',      actif: false },
  ];

  // ── Statistiques personnelles ─────────────────────────
  stats: StatCard[] = [
    {
      titre: 'Scrutins actifs',
      valeur: '4',
      variation: '+2 ce mois-ci',
      variationPositive: true,
      sousTitre: '',
      icone: 'bi-clipboard2-check'
    },
    {
      titre: 'Candidats',
      valeur: '24',
      sousTitre: 'Total enregistrés',
      icone: 'bi-people'
    },
    {
      titre: 'Inscrits',
      valeur: '10 254',
      variation: '+12% Nouveaux électeurs',
      variationPositive: true,
      sousTitre: '',
      icone: 'bi-person-check'
    },
    {
      titre: 'Votes exprimés',
      valeur: '5 642',
      sousTitre: 'Total à ce jour',
      icone: 'bi-check2-circle'
    },
  ];

  // ── Scrutins fictifs ──────────────────────────────────
  scrutins: Scrutin[] = [
    {
      id: 1,
      titre: 'Élection du Bureau des Étudiants 2024 — Faculté des Sciences',
      dateFin: 'Fin le 12 Mai 2024',
      statut: 'en_cours',
      participation: 52,
      votesExprimes: 1450,
      totalElecteurs: 2800
    },
    {
      id: 2,
      titre: 'Référendum Interne : Modernisation des Infrastructures Sportives',
      dateFin: 'Fin le 20 Juin 2024',
      statut: 'planifie',
      participation: 0,
      votesExprimes: 0,
      totalElecteurs: 500
    },
    {
      id: 3,
      titre: 'Vote du Conseil d\'Administration — Session Printemps',
      dateFin: 'Fin le 15 Avril 2024',
      statut: 'termine',
      participation: 94,
      votesExprimes: 45,
      totalElecteurs: 48
    },
    {
      id: 4,
      titre: 'Budget Participatif 2024 : Projets Écologiques',
      dateFin: 'Fin le 28 Mai 2024',
      statut: 'en_cours',
      participation: 25,
      votesExprimes: 890,
      totalElecteurs: 3500
    },
    {
      id: 5,
      titre: 'Élection des Représentants du Personnel — Collège B',
      dateFin: 'Fin À définir',
      statut: 'brouillon',
      participation: 0,
      votesExprimes: 0,
      totalElecteurs: 120
    },
    {
      id: 6,
      titre: 'Consultation Citoyenne : Futur Centre Culturel',
      dateFin: 'Fin le 02 Mars 2024',
      statut: 'termine',
      participation: 80,
      votesExprimes: 3200,
      totalElecteurs: 4000
    },
  ];

  // Changer l'onglet actif
  setOnglet(route: string): void {
    this.ongletActif = route;
    this.navItems.forEach(item => item.actif = item.route === route);
  }

  // Retourne le libellé du statut pour l'affichage
  getLibelleStatut(statut: StatutScrutin): string {
    const libelles: Record<StatutScrutin, string> = {
      en_cours: 'En cours',
      planifie: 'Planifié',
      termine:  'Terminé',
      brouillon:'Brouillon'
    };
    return libelles[statut];
  }

  // Retourne l'icône selon le statut
  getIconeStatut(statut: StatutScrutin): string {
    const icones: Record<StatutScrutin, string> = {
      en_cours: 'bi-clock-fill',
      planifie: 'bi-calendar-event',
      termine:  'bi-check-circle-fill',
      brouillon:'bi-pencil-square'
    };
    return icones[statut];
  }

  // Retourne la couleur de la barre de progression
  getCouleurParticipation(taux: number): string {
    if (taux >= 75) return '#22c55e'; // vert
    if (taux >= 40) return '#2563EB'; // bleu
    if (taux > 0)   return '#f59e0b'; // orange
    return '#e5e7eb';                 // gris
  }
}
