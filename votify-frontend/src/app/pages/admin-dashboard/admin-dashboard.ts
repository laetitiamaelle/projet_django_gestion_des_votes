// ============================================================
// src/app/pages/admin-dashboard/admin-dashboard.component.ts
// ============================================================

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import {
  VotifyService,
  ScrutinAPI,
  CandidatAPI,
  CandidatForm,
  InscriptionAPI,
  StatsDashboard,
  ResultatScrutin,
  UserProfile,
} from '../../services/votify.service';
import { forkJoin, from } from 'rxjs';
import { concatMap } from 'rxjs/operators';

type VueActive =
  | 'dashboard' | 'creer-scrutin' | 'detail-scrutin'
  | 'modifier-scrutin' | 'inscriptions' | 'resultats' | 'profil';

type StatutScrutin = 'en_cours' | 'planifie' | 'termine' | 'brouillon';

interface ScrutinUI extends ScrutinAPI {
  statut: StatutScrutin;
  participation: number;
  votesExprimes: number;
  totalElecteurs: number;
  dateFin: string;
}

interface StatCard {
  titre: string; valeur: string; sousTitre: string; icone: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboardComponent implements OnInit {

  private svc = inject(VotifyService);
  private fb  = inject(FormBuilder);

  vueActive          = signal<VueActive>('dashboard');
  scrutinSelectionne = signal<ScrutinUI | null>(null);
  sidebarOuverte     = signal(false);
  chargement         = signal(false);
  erreur             = signal<string | null>(null);
  msgSucces          = signal<string | null>(null);

  // Profil utilisateur
  profil: UserProfile | null = null;
  get nomAffiche(): string { return this.profil ? VotifyService.getNomAffiche(this.profil) : ''; }
  get initialesUser(): string { return this.profil ? VotifyService.getInitialesUser(this.profil) : '...'; }

  navItems = [
    { label: 'Tableau de bord', icone: 'bi-grid-1x2-fill',   vue: 'dashboard'    },
    { label: 'Mes scrutins',    icone: 'bi-clipboard2-check', vue: 'dashboard'    },
    { label: 'Inscriptions',    icone: 'bi-person-plus-fill', vue: 'inscriptions' },
    { label: 'Résultats',       icone: 'bi-bar-chart-fill',   vue: 'resultats'    },
    { label: 'Profil',          icone: 'bi-person-circle',    vue: 'profil'       },
  ];

  stats: StatCard[] = [
    { titre: 'Scrutins actifs', valeur: '--', sousTitre: '',                  icone: 'bi-clipboard2-check' },
    { titre: 'Candidats',       valeur: '--', sousTitre: 'Total enregistrés', icone: 'bi-people'           },
    { titre: 'Inscrits',        valeur: '--', sousTitre: 'Électeurs validés', icone: 'bi-person-check'     },
    { titre: 'Votes exprimés',  valeur: '--', sousTitre: 'Total à ce jour',   icone: 'bi-check2-circle'    },
  ];

  scrutins:     ScrutinUI[]      = [];
  candidats:    CandidatAPI[]    = [];
  inscriptions: InscriptionAPI[] = [];
  resultats:    ResultatScrutin | null = null;

  filtreInscription = 'tous';

  get inscriptionsFiltrees(): InscriptionAPI[] {
    if (this.filtreInscription === 'tous') return this.inscriptions;
    const map: Record<string, string> = { en_attente: 'en_attente', validee: 'accepte', refusee: 'refuse' };
    return this.inscriptions.filter(i => i.statut === (map[this.filtreInscription] ?? this.filtreInscription));
  }

  scrutinForm:  FormGroup;
  modifierForm: FormGroup;
  visibilite = signal<'public' | 'prive'>('public');

  // Candidats saisis pendant la création — envoyés TOUS après création du scrutin
  candidatsAAjouter: CandidatForm[] = [];
  nouveauCandidat: CandidatForm = { nom: '', poste: '', description: '', photoFile: null, photoPreview: null };
  afficherFormCandidats = signal(false);
  envoiCandidats = signal(false);

  // Candidat à ajouter dans la vue détail
  nouveauCandidatDetail: CandidatForm = { nom: '', poste: '', description: '', photoFile: null, photoPreview: null };
  afficherFormCandidatsDetail = signal(false);

  constructor() {
    this.scrutinForm = this.fb.group({
      titre:       ['', [Validators.required, Validators.minLength(5)]],
      description: ['', Validators.required],
      dateDebut:   ['', Validators.required],
      dateFin:     ['', Validators.required],
    });
    this.modifierForm = this.fb.group({
      titre:       ['', Validators.required],
      description: [''],
      dateDebut:   [''],
      dateFin:     [''],
    });
  }

  ngOnInit(): void {
    this.chargement.set(true);
    forkJoin({
      profil:   this.svc.getProfile(),
      stats:    this.svc.getStatsDashboard(),
      scrutins: this.svc.getMesScrutins(),
    }).subscribe({
      next: ({ profil, stats, scrutins }) => {
        this.profil = profil;
        this.appliquerStats(stats);
        this.scrutins = scrutins.map(s => this.enrichirScrutin(s));
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger le tableau de bord.');
        this.chargement.set(false);
      }
    });
  }

  private appliquerStats(s: StatsDashboard): void {
    this.stats = [
      { titre: 'Scrutins actifs', valeur: String(s.scrutins_actifs), sousTitre: '',                  icone: 'bi-clipboard2-check' },
      { titre: 'Candidats',       valeur: String(s.candidats),       sousTitre: 'Total enregistrés', icone: 'bi-people'           },
      { titre: 'Inscrits',        valeur: String(s.inscrits),        sousTitre: 'Électeurs validés', icone: 'bi-person-check'     },
      { titre: 'Votes exprimés',  valeur: String(s.votes_exprimes),  sousTitre: 'Total à ce jour',   icone: 'bi-check2-circle'    },
    ];
  }

  private enrichirScrutin(s: ScrutinAPI): ScrutinUI {
    return {
      ...s,
      statut:         VotifyService.getStatut(s),
      dateFin:        `Fin le ${VotifyService.formatDate(s.date_fin)}`,
      participation:  0,
      votesExprimes:  0,
      totalElecteurs: 0,
    };
  }

  private rafraichirStats(): void {
    this.svc.getStatsDashboard().subscribe({ next: s => this.appliquerStats(s) });
  }

  aller(vue: any): void {
    this.vueActive.set(vue);
    this.erreur.set(null);
    this.msgSucces.set(null);
    if (vue === 'inscriptions') this.chargerInscriptions();
  }

  voirDetail(scrutin: ScrutinUI): void {
    this.scrutinSelectionne.set(scrutin);
    this.chargement.set(true);
    this.afficherFormCandidatsDetail.set(false);

    this.svc.getCandidatsScrutin(scrutin.id).subscribe({
      next: (c) => { this.candidats = c; this.chargement.set(false); },
      error: ()  => { this.candidats = []; this.chargement.set(false); }
    });

    if (VotifyService.getStatut(scrutin) === 'termine') {
      this.svc.getResultats(scrutin.id).subscribe({
        next: (r) => { this.resultats = r; },
        error: ()  => { this.resultats = null; }
      });
    } else {
      this.resultats = null;
    }
    this.vueActive.set('detail-scrutin');
  }

  ouvrirModifier(scrutin: ScrutinUI): void {
    this.scrutinSelectionne.set(scrutin);
    this.modifierForm.patchValue({
      titre:       scrutin.titre,
      description: scrutin.description,
      dateDebut:   scrutin.date_debut?.substring(0, 16) ?? '',
      dateFin:     scrutin.date_fin?.substring(0, 16) ?? '',
    });
    this.vueActive.set('modifier-scrutin');
  }

  // Photo candidat
  onPhotoSelected(event: Event, cible: 'creation' | 'detail'): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      if (cible === 'creation') {
        this.nouveauCandidat = { ...this.nouveauCandidat, photoFile: file, photoPreview: preview };
      } else {
        this.nouveauCandidatDetail = { ...this.nouveauCandidatDetail, photoFile: file, photoPreview: preview };
      }
    };
    reader.readAsDataURL(file);
  }

  ajouterCandidatAAjouterListe(): void {
    if (!this.nouveauCandidat.nom.trim()) return;
    this.candidatsAAjouter.push({ ...this.nouveauCandidat });
    this.nouveauCandidat = { nom: '', poste: '', description: '', photoFile: null, photoPreview: null };
  }

  supprimerCandidatAAjouter(idx: number): void {
    this.candidatsAAjouter.splice(idx, 1);
  }

  onSubmitScrutin(): void {
    if (this.scrutinForm.invalid) { this.scrutinForm.markAllAsTouched(); return; }
    this.chargement.set(true);
    const v = this.scrutinForm.value;

    this.svc.creerScrutin({
      titre: v.titre, description: v.description,
      date_debut: v.dateDebut, date_fin: v.dateFin, actif: true,
    }).subscribe({
      next: (scrutin) => {
        const scrutinUI = this.enrichirScrutin(scrutin);
        this.scrutins.unshift(scrutinUI);

        if (this.candidatsAAjouter.length === 0) {
          this.finaliserCreation(scrutinUI);
          return;
        }

        this.envoiCandidats.set(true);
        const liste = [...this.candidatsAAjouter];
        from(liste).pipe(
          concatMap(c => this.svc.ajouterCandidat(scrutin.id, c))
        ).subscribe({
          complete: () => { this.envoiCandidats.set(false); this.finaliserCreation(scrutinUI); },
          error:    () => { this.erreur.set('Certains candidats n\'ont pas pu être ajoutés.'); this.envoiCandidats.set(false); this.finaliserCreation(scrutinUI); }
        });
      },
      error: () => { this.erreur.set('Erreur lors de la création du scrutin.'); this.chargement.set(false); }
    });
  }

  private finaliserCreation(scrutin: ScrutinUI): void {
    this.scrutinForm.reset();
    this.candidatsAAjouter = [];
    this.nouveauCandidat = { nom: '', poste: '', description: '', photoFile: null, photoPreview: null };
    this.chargement.set(false);
    this.msgSucces.set('Scrutin créé avec succès !');
    this.rafraichirStats();
    this.vueActive.set('dashboard');
  }

  onSubmitModifier(): void {
    if (this.modifierForm.invalid) return;
    const s = this.scrutinSelectionne(); if (!s) return;
    this.chargement.set(true);
    const v = this.modifierForm.value;

    this.svc.modifierScrutin(s.id, {
      titre: v.titre, description: v.description,
      ...(v.dateDebut && { date_debut: v.dateDebut }),
      ...(v.dateFin   && { date_fin:   v.dateFin   }),
    }).subscribe({
      next: (maj) => {
        const enrichi = this.enrichirScrutin(maj);
        const idx = this.scrutins.findIndex(x => x.id === s.id);
        if (idx > -1) this.scrutins[idx] = enrichi;
        this.scrutinSelectionne.set(enrichi);
        this.chargement.set(false);
        this.msgSucces.set('Scrutin modifié avec succès !');
        this.voirDetail(enrichi);
      },
      error: () => { this.erreur.set('Erreur lors de la modification.'); this.chargement.set(false); }
    });
  }

  chargerInscriptions(): void {
    this.chargement.set(true);
    this.svc.getInscriptionsEnAttente().subscribe({
      next: (d) => { this.inscriptions = d; this.chargement.set(false); },
      error: ()  => { this.erreur.set('Impossible de charger les inscriptions.'); this.chargement.set(false); }
    });
  }

  validerInscription(id: number): void {
    this.svc.accepterInscription(id).subscribe({
      next: () => { const i = this.inscriptions.find(x => x.id === id); if (i) i.statut = 'accepte'; this.rafraichirStats(); },
      error: () => this.erreur.set('Erreur lors de la validation.')
    });
  }

  refuserInscription(id: number): void {
    this.svc.refuserInscription(id).subscribe({
      next: () => { const i = this.inscriptions.find(x => x.id === id); if (i) i.statut = 'refuse'; },
      error: () => this.erreur.set('Erreur lors du refus.')
    });
  }

  ajouterCandidatAuScrutin(): void {
    const s = this.scrutinSelectionne();
    if (!s || !this.nouveauCandidatDetail.nom.trim()) return;

    this.svc.ajouterCandidat(s.id, this.nouveauCandidatDetail).subscribe({
      next: (c) => {
        this.candidats.push(c);
        this.nouveauCandidatDetail = { nom: '', poste: '', description: '', photoFile: null, photoPreview: null };
        this.afficherFormCandidatsDetail.set(false);
        this.rafraichirStats();
      },
      error: () => this.erreur.set('Erreur lors de l\'ajout du candidat.')
    });
  }

  supprimerCandidatAPI(id: number): void {
    if (!confirm('Supprimer ce candidat ?')) return;
    this.svc.supprimerCandidat(id).subscribe({
      next: () => { this.candidats = this.candidats.filter(c => c.id !== id); this.rafraichirStats(); },
      error: () => this.erreur.set('Erreur lors de la suppression.')
    });
  }

  getLibelleStatut(s: StatutScrutin): string {
    return { en_cours: 'En cours', planifie: 'Planifié', termine: 'Terminé', brouillon: 'Brouillon' }[s];
  }
  getIconeStatut(s: StatutScrutin): string {
    return { en_cours: 'bi-clock-fill', planifie: 'bi-calendar-event', termine: 'bi-check-circle-fill', brouillon: 'bi-pencil-square' }[s];
  }
  getCouleurParticipation(p: number): string {
    if (p >= 75) return '#22c55e'; if (p >= 40) return '#2563EB'; if (p > 0) return '#f59e0b'; return '#e5e7eb';
  }
  getPourcentageCandidat(id: number): number {
    return this.resultats?.resultats.find(x => x.candidat_id === id)?.pourcentage ?? 0;
  }
  getVotesCandidat(id: number): number {
    return this.resultats?.resultats.find(x => x.candidat_id === id)?.votes ?? 0;
  }
  getInitiales(nom: string): string {
    return nom.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
  }
  private couleurs = ['#4f46e5', '#0891b2', '#be185d', '#7c3aed', '#065f46', '#b45309'];
  getCouleurCandidat(idx: number): string { return this.couleurs[idx % this.couleurs.length]; }
  getLibelleStatutInscription(s: string): string {
    return ({ en_attente: 'En attente', accepte: 'Validée', refuse: 'Refusée' } as any)[s] ?? s;
  }
  getClasseInscription(s: string): string {
    return ({ en_attente: 'en-attente', accepte: 'validee', refuse: 'refusee' } as any)[s] ?? '';
  }
  get scrutinsTermines(): ScrutinUI[] { return this.scrutins.filter(s => s.statut === 'termine'); }
  fermerMessage(): void { this.erreur.set(null); this.msgSucces.set(null); }
}
