// ============================================================
// src/app/pages/electeur-dashboard/electeur-dashboard.component.ts
// Dashboard électeur — connecté au backend Django/DRF
// ============================================================

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  VotifyService,
  ScrutinAPI,
  CandidatAPI,
  ResultatScrutin,
  InscriptionAPI,
  UserProfile,
} from '../../services/votify.service';
import { forkJoin } from 'rxjs';

// ── Types UI ──────────────────────────────────────────────
type VueActive = 'accueil' | 'rechercher' | 'mes-scrutins' | 'detail' | 'resultats' | 'profil';
type StatutScrutin = 'en_cours' | 'planifie' | 'termine' | 'brouillon';

// ── Interface enrichie pour affichage ─────────────────────
interface ScrutinUI extends ScrutinAPI {
  statut: StatutScrutin;
  estInscrit: boolean;
  aVote: boolean;
  inscriptionId?: number;       // ID de l'InscriptionScrutin si inscrit
  inscriptionStatut?: string;   // 'en_attente' | 'accepte' | 'refuse'
  participation: number;
}

@Component({
  selector: 'app-electeur-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './electeur-dashboard.html',
  styleUrls: ['./electeur-dashboard.scss']
})
export class ElecteurDashboardComponent implements OnInit {

  private svc = inject(VotifyService);

  // ── Navigation ────────────────────────────────────────
  vueActive      = signal<VueActive>('accueil');
  sidebarOuverte = signal(false);
  scrutinActif   = signal<ScrutinUI | null>(null);

  // ── État ──────────────────────────────────────────────
  chargement  = signal(false);
  erreur      = signal<string | null>(null);
  msgSucces   = signal<string | null>(null);

  // ── Profil ────────────────────────────────────────────
  profil: UserProfile | null = null;
  get nomAffiche(): string  { return this.profil ? VotifyService.getNomAffiche(this.profil) : ''; }
  get prenomCourt(): string {
    if (!this.profil) return '';
    return this.profil.first_name || this.profil.username;
  }
  get initialesUser(): string { return this.profil ? VotifyService.getInitialesUser(this.profil) : '...'; }

  navItems = [
    { label: 'Accueil',               icone: 'bi-house-fill',       vue: 'accueil'      },
    { label: 'Rechercher un scrutin', icone: 'bi-search',           vue: 'rechercher'   },
    { label: 'Mes scrutins',          icone: 'bi-clipboard2-check', vue: 'mes-scrutins' },
    { label: 'Résultats',             icone: 'bi-bar-chart-fill',   vue: 'resultats'    },
    { label: 'Profil',                icone: 'bi-person-circle',    vue: 'profil'       },
  ];

  // ── Données ───────────────────────────────────────────
  scrutinsPublics:  ScrutinUI[] = [];  // Tous les scrutins actifs
  mesInscriptions:  InscriptionAPI[] = [];
  candidats:        CandidatAPI[] = [];
  resultats:        ResultatScrutin | null = null;

  // ── Recherche / filtres ───────────────────────────────
  recherche   = '';
  filtreActif = 'Tout';
  filtres     = ['Tout', 'En cours', 'Terminé', 'Planifié'];

  get scrutinsFiltres(): ScrutinUI[] {
    return this.scrutinsPublics.filter(s => {
      const matchFiltre =
        this.filtreActif === 'Tout'     ||
        (this.filtreActif === 'En cours' && s.statut === 'en_cours')  ||
        (this.filtreActif === 'Terminé'  && s.statut === 'termine')   ||
        (this.filtreActif === 'Planifié' && s.statut === 'planifie');
      const matchRecherche = !this.recherche.trim() ||
        s.titre.toLowerCase().includes(this.recherche.toLowerCase());
      return matchFiltre && matchRecherche;
    });
  }

  // Scrutins recommandés = les en_cours non encore votés
  get scrutinsRecommandes(): ScrutinUI[] {
    return this.scrutinsPublics
      .filter(s => s.statut === 'en_cours' || s.statut === 'planifie')
      .slice(0, 6);
  }

  // Mes scrutins inscrits
  get mesScrutinsInscrits(): ScrutinUI[] {
    return this.scrutinsPublics.filter(s => s.estInscrit);
  }

  // Historique = scrutins terminés ou sur lesquels j'ai voté
  get historiqueScrutins(): ScrutinUI[] {
    return this.scrutinsPublics.filter(s => s.aVote || s.statut === 'termine');
  }

  // ── Init ─────────────────────────────────────────────
  ngOnInit(): void {
    this.chargement.set(true);
    forkJoin({
      profil:       this.svc.getProfile(),
      scrutins:     this.svc.getScrutinsPublics(),
      inscriptions: this.svc.getMesInscriptions(),
    }).subscribe({
      next: ({ profil, scrutins, inscriptions }) => {
        this.profil = profil;
        this.mesInscriptions = inscriptions;
        this.scrutinsPublics = scrutins.map(s => this.enrichirScrutin(s, inscriptions));
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger les données.');
        this.chargement.set(false);
      }
    });
  }

  private enrichirScrutin(s: ScrutinAPI, inscriptions: InscriptionAPI[]): ScrutinUI {
    const insc = inscriptions.find(i => i.scrutin === s.id);
    return {
      ...s,
      statut:            VotifyService.getStatut(s),
      estInscrit:        !!insc,
      inscriptionId:     insc?.id,
      inscriptionStatut: insc?.statut,
      aVote:             false, // à enrichir avec un endpoint dédié si disponible
      participation:     0,
    };
  }

  // ── Navigation ────────────────────────────────────────

  aller(vue: any): void {
    this.vueActive.set(vue);
    this.sidebarOuverte.set(false);
    this.erreur.set(null);
    this.msgSucces.set(null);
    window.scrollTo(0, 0);
  }

  ouvrirDetail(scrutin: ScrutinUI): void {
    this.scrutinActif.set(scrutin);
    this.candidats = [];
    this.resultats = null;
    this.chargement.set(true);

    this.svc.getCandidatsScrutin(scrutin.id).subscribe({
      next: (c) => { this.candidats = c; this.chargement.set(false); },
      error: ()  => { this.candidats = []; this.chargement.set(false); }
    });

    // Charger les résultats si terminé
    if (scrutin.statut === 'termine') {
      this.svc.getResultats(scrutin.id).subscribe({
        next:  (r) => { this.resultats = r; },
        error: ()  => { this.resultats = null; }
      });
    }

    this.vueActive.set('detail');
    this.sidebarOuverte.set(false);
    window.scrollTo(0, 0);
  }

  ouvrirResultats(scrutin: ScrutinUI): void {
    this.scrutinActif.set(scrutin);
    this.resultats = null;
    this.chargement.set(true);

    forkJoin({
      candidats: this.svc.getCandidatsScrutin(scrutin.id),
      resultats: this.svc.getResultats(scrutin.id),
    }).subscribe({
      next: ({ candidats, resultats }) => {
        this.candidats = candidats;
        this.resultats = resultats;
        this.chargement.set(false);
      },
      error: () => {
        this.chargement.set(false);
        this.erreur.set('Impossible de charger les résultats.');
      }
    });

    this.vueActive.set('resultats');
    this.sidebarOuverte.set(false);
    window.scrollTo(0, 0);
  }

  // ── Inscription à un scrutin ──────────────────────────

  sInscrire(scrutin: ScrutinUI): void {
    this.svc.sInscrireScrutin(scrutin.id).subscribe({
      next: (insc) => {
        scrutin.estInscrit        = true;
        scrutin.inscriptionId     = insc.id;
        scrutin.inscriptionStatut = insc.statut;
        this.mesInscriptions.push(insc);
        this.msgSucces.set('Inscription envoyée ! En attente de validation par l\'administrateur.');
      },
      error: (err) => {
        const msg = err?.error?.detail ?? err?.error?.non_field_errors?.[0] ?? 'Erreur lors de l\'inscription.';
        this.erreur.set(msg);
      }
    });
  }

  // ── Vote ──────────────────────────────────────────────

  candidatChoisi: number | null = null;

  choisirCandidat(candidatId: number): void {
    this.candidatChoisi = candidatId;
  }

  confirmerVote(): void {
    if (!this.candidatChoisi) {
      this.erreur.set('Veuillez choisir un candidat.');
      return;
    }
    this.chargement.set(true);
    this.svc.voter(this.candidatChoisi).subscribe({
      next: () => {
        const s = this.scrutinActif();
        if (s) {
          s.aVote = true;
          // Mettre à jour dans la liste globale
          const idx = this.scrutinsPublics.findIndex(x => x.id === s.id);
          if (idx > -1) this.scrutinsPublics[idx].aVote = true;
        }
        this.candidatChoisi = null;
        this.chargement.set(false);
        this.msgSucces.set('Vote enregistré avec succès !');
        // Charger les résultats maintenant
        if (s) this.ouvrirResultats(s);
      },
      error: (err) => {
        const msg = err?.error?.error ?? 'Erreur lors du vote.';
        this.erreur.set(msg);
        this.chargement.set(false);
      }
    });
  }

  // ── Helpers UI ────────────────────────────────────────

  getLibelleStatut(statut: string): string {
    const map: Record<string, string> = {
      en_cours: 'En cours', planifie: 'À venir',
      termine: 'Terminé', brouillon: 'Brouillon',
    };
    return map[statut] ?? statut;
  }

  getBoutonLabel(s: ScrutinUI): string {
    if (s.aVote) return 'Voir résultats';
    if (!s.estInscrit) return 'S\'inscrire';
    if (s.inscriptionStatut === 'en_attente') return 'En attente';
    if (s.statut === 'en_cours' && s.inscriptionStatut === 'accepte') return 'Voter';
    return 'Détails';
  }

  getBoutonClass(s: ScrutinUI): string {
    if (s.aVote) return 'btn-resultats';
    if (!s.estInscrit) return 'btn-details';
    if (s.inscriptionStatut === 'en_attente') return 'btn-attente';
    return 'btn-voter';
  }

  onBoutonScrutin(s: ScrutinUI): void {
    if (s.aVote || s.statut === 'termine') { this.ouvrirResultats(s); return; }
    if (!s.estInscrit) { this.ouvrirDetail(s); return; }
    this.ouvrirDetail(s);
  }

  getPourcentageCandidat(candidatId: number): number {
    return this.resultats?.resultats.find(x => x.candidat_id === candidatId)?.pourcentage ?? 0;
  }

  getVotesCandidat(candidatId: number): number {
    return this.resultats?.resultats.find(x => x.candidat_id === candidatId)?.votes ?? 0;
  }

  // Candidat gagnant = celui avec le plus de votes
  get gagnant() {
    if (!this.resultats || this.resultats.resultats.length === 0) return null;
    return this.resultats.resultats.reduce((a, b) => a.votes > b.votes ? a : b);
  }

  getInitiales(nom: string): string {
    return nom.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
  }

  private couleurs = ['#4f46e5', '#0891b2', '#be185d', '#7c3aed', '#065f46', '#b45309'];
  getCouleurCandidat(idx: number): string { return this.couleurs[idx % this.couleurs.length]; }

  // Couleur de fond pour les vignettes selon l'index
  private fondsCouleurs = ['#eef2ff', '#e0f2fe', '#f0fdf4', '#fdf4ff', '#fff7ed', '#f0f9ff'];
  getCouleurFond(idx: number): string { return this.fondsCouleurs[idx % this.fondsCouleurs.length]; }

  get totalVotes(): number { return this.resultats?.total_votes ?? 0; }

  fermerMessage(): void { this.erreur.set(null); this.msgSucces.set(null); }
}
