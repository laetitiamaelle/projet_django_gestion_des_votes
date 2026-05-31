// ============================================================
// COMMANDE CLI : ng generate component pages/dashboard --standalone --skip-tests
//
// RÔLE : Dashboard superadmin avec sidebar, cartes stats,
//        tableau des demandes et tableau des administrateurs.
//        Toutes les données sont fictives (pas d'appel API).
// ============================================================

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// ── Interfaces pour typer les données fictives ────────────

interface StatCard {
  titre: string;
  valeur: string;
  variation?: string;        // Ex: "+12%"
  variationPositive?: boolean;
  sousTitre: string;
  icone: string;
}

interface DemandeAdmin {
  id: number;
  prenom: string;
  nom: string;
  organisation: string;
  date: string;
  statut: 'en_attente' | 'validee' | 'refusee';
  initiales: string;
}

interface Administrateur {
  id: number;
  prenom: string;
  nom: string;
  organisation: string;
  derniereActivite: string;
  actif: boolean;
  initiales: string;
}

interface NavItem {
  label: string;
  icone: string;
  route: string;
  actif: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent {

  // Onglet actif de la sidebar (pour simuler la navigation)
  ongletActif = 'dashboard';

  // ── Données fictives : navigation sidebar ─────────────
  navItems: NavItem[] = [
    { label: 'Tableau de bord',   icone: 'bi-grid-1x2-fill',    route: 'dashboard',       actif: true  },
    { label: 'Demandes admins',   icone: 'bi-person-plus-fill',  route: 'demandes',        actif: false },
    { label: 'Administrateurs',   icone: 'bi-people-fill',       route: 'administrateurs', actif: false },
    
  ];

  // ── Données fictives : cartes statistiques ────────────
  stats: StatCard[] = [
    {
      titre: 'Total Scrutins',
      valeur: '1 284',
      variation: '+12%',
      variationPositive: true,
      sousTitre: 'Scrutins créés ce mois-ci',
      icone: 'bi-clipboard2-check'
    },
    {
      titre: 'Admins Actifs',
      valeur: '342',
      sousTitre: 'Comptes administrateurs validés',
      icone: 'bi-people'
    },
    {
      titre: 'Votes aujourd\'hui',
      valeur: '18 492',
      variation: '+5.2%',
      variationPositive: true,
      sousTitre: 'Participations enregistrées',
      icone: 'bi-bar-chart-line'
    },
    {
      titre: 'Demandes en attente',
      valeur: '24',
      sousTitre: 'Nouveaux dossiers à traiter',
      icone: 'bi-person-plus'
    },
  ];

  // ── Données fictives : demandes administrateurs ───────
  demandes: DemandeAdmin[] = [
    { id: 1, prenom: 'Marc',     nom: 'Dubois',  organisation: 'Université Sorbonne',   date: '12 Oct 2023', statut: 'en_attente', initiales: 'MD' },
    { id: 2, prenom: 'Sophie',   nom: 'Laurent', organisation: 'Amnesty International', date: '11 Oct 2023', statut: 'en_attente', initiales: 'SL' },
    { id: 3, prenom: 'Jean-Luc', nom: 'Picard',  organisation: 'Starfleet Academy',     date: '10 Oct 2023', statut: 'en_attente', initiales: 'JP' },
  ];

  // ── Données fictives : administrateurs ────────────────
  administrateurs: Administrateur[] = [
    { id: 1, prenom: 'Amélie',  nom: 'Poulain',  organisation: 'École des Beaux-Arts', derniereActivite: 'Il y a 2h',      actif: true,  initiales: 'AP' },
    { id: 2, prenom: 'Thomas',  nom: 'Pesquet',  organisation: 'ESA Lyon',             derniereActivite: 'Il y a 5 min',   actif: true,  initiales: 'TP' },
    { id: 3, prenom: 'Marie',   nom: 'Curie',    organisation: 'Institut du Radium',   derniereActivite: 'Hier',           actif: true,  initiales: 'MC' },
    { id: 4, prenom: 'Victor',  nom: 'Hugo',     organisation: 'Mairie de Paris',      derniereActivite: 'Il y a 1 mois',  actif: false, initiales: 'VH' },
  ];

  // ── Actions fictives (simulation sans API) ────────────

  // Simuler validation d'une demande
  validerDemande(id: number): void {
    const demande = this.demandes.find(d => d.id === id);
    if (demande) demande.statut = 'validee';
  }

  // Simuler refus d'une demande
  refuserDemande(id: number): void {
    const demande = this.demandes.find(d => d.id === id);
    if (demande) demande.statut = 'refusee';
  }

  // Changer l'onglet actif dans la sidebar
  setOnglet(route: string): void {
    this.ongletActif = route;
    this.navItems.forEach(item => item.actif = item.route === route);
  }
}
