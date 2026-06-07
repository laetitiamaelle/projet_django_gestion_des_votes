// ============================================================
// src/app/services/votify.service.ts — Version complète
// ============================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Interfaces ────────────────────────────────────────────

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  telephone?: string;
}

export interface ScrutinAPI {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  actif: boolean;
  date_creation: string;
  admin?: number;
}

export interface CandidatAPI {
  id: number;
  scrutin: number;
  nom: string;
  poste: string;
  description: string;
  photo?: string | null;
  photo_url?: string | null;
  date_creation?: string;
}

export interface CandidatForm {
  nom: string;
  poste: string;
  description: string;
  photoFile?: File | null;
  photoPreview?: string | null;
}

export interface InscriptionAPI {
  id: number;
  electeur: number;
  electeur_username?: string;
  electeur_email?: string;
  scrutin: number;
  scrutin_titre?: string;
  statut: 'en_attente' | 'accepte' | 'refuse';
  date_inscription: string;
}

export interface StatsDashboard {
  scrutins_actifs: number;
  candidats: number;
  inscrits: number;
  votes_exprimes: number;
}

export interface ResultatScrutin {
  total_votes: number;
  resultats: {
    candidat_id: number;
    candidat: string;
    votes: number;
    pourcentage: number;
  }[];
}

// ── Service ──────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class VotifyService {

  private http = inject(HttpClient);
  private BASE = 'http://localhost:8000/api';

  // ── Headers ───────────────────────────────────────────

  private headers(): HttpHeaders {
    const token = localStorage.getItem('access_token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private headersMultipart(): HttpHeaders {
    const token = localStorage.getItem('access_token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ══════════════════════════════════════════════════════
  // AUTH / PROFIL
  // ══════════════════════════════════════════════════════

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(
      `${this.BASE}/auth/profile/`,
      { headers: this.headers() }
    );
  }

  // ══════════════════════════════════════════════════════
  // SCRUTINS — ADMIN
  // ══════════════════════════════════════════════════════

  getMesScrutins(): Observable<ScrutinAPI[]> {
    return this.http.get<ScrutinAPI[]>(
      `${this.BASE}/scrutins/mes-scrutins/`,
      { headers: this.headers() }
    );
  }

  creerScrutin(data: Partial<ScrutinAPI>): Observable<ScrutinAPI> {
    return this.http.post<ScrutinAPI>(
      `${this.BASE}/scrutins/creer/`,
      data,
      { headers: this.headers() }
    );
  }

  modifierScrutin(id: number, data: Partial<ScrutinAPI>): Observable<ScrutinAPI> {
    return this.http.patch<ScrutinAPI>(
      `${this.BASE}/scrutins/modifier/${id}/`,
      data,
      { headers: this.headers() }
    );
  }

  supprimerScrutin(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.BASE}/scrutins/supprimer/${id}/`,
      { headers: this.headers() }
    );
  }

  getDetailScrutin(id: number): Observable<ScrutinAPI> {
    return this.http.get<ScrutinAPI>(
      `${this.BASE}/scrutins/detail/${id}/`,
      { headers: this.headers() }
    );
  }

  getStatsDashboard(): Observable<StatsDashboard> {
    return this.http.get<StatsDashboard>(
      `${this.BASE}/scrutins/stats-dashboard/`,
      { headers: this.headers() }
    );
  }

  // ══════════════════════════════════════════════════════
  // SCRUTINS — ÉLECTEUR
  // ══════════════════════════════════════════════════════

  /** Tous les scrutins publics actifs */
  getScrutinsPublics(): Observable<ScrutinAPI[]> {
    return this.http.get<ScrutinAPI[]>(
      `${this.BASE}/scrutins/publics/`,
      { headers: this.headers() }
    );
  }

  // ══════════════════════════════════════════════════════
  // CANDIDATS
  // ══════════════════════════════════════════════════════

  getCandidatsScrutin(scrutinId: number): Observable<CandidatAPI[]> {
    return this.http.get<CandidatAPI[]>(
      `${this.BASE}/candidats/scrutin/${scrutinId}/`,
      { headers: this.headers() }
    );
  }

  ajouterCandidat(scrutinId: number, candidat: CandidatForm): Observable<CandidatAPI> {
    const fd = new FormData();
    fd.append('scrutin', String(scrutinId));
    fd.append('nom', candidat.nom);
    fd.append('poste', candidat.poste ?? '');
    fd.append('description', candidat.description ?? '');
    if (candidat.photoFile) {
      fd.append('photo', candidat.photoFile, candidat.photoFile.name);
    }
    return this.http.post<CandidatAPI>(
      `${this.BASE}/candidats/ajouter/`,
      fd,
      { headers: this.headersMultipart() }
    );
  }

  supprimerCandidat(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.BASE}/candidats/supprimer/${id}/`,
      { headers: this.headers() }
    );
  }

  // ══════════════════════════════════════════════════════
  // INSCRIPTIONS
  // ══════════════════════════════════════════════════════

  /** Toutes les inscriptions de l'électeur connecté */
  getMesInscriptions(): Observable<InscriptionAPI[]> {
    return this.http.get<InscriptionAPI[]>(
      `${this.BASE}/votes/mes-inscriptions/`,
      { headers: this.headers() }
    );
  }

  /** S'inscrire à un scrutin (électeur) */
  sInscrireScrutin(scrutinId: number): Observable<InscriptionAPI> {
    return this.http.post<InscriptionAPI>(
      `${this.BASE}/votes/inscription/`,
      { scrutin: scrutinId },
      { headers: this.headers() }
    );
  }

  /** Inscriptions en attente — vue admin */
  getInscriptionsEnAttente(): Observable<InscriptionAPI[]> {
    return this.http.get<InscriptionAPI[]>(
      `${this.BASE}/votes/inscriptions-attente/`,
      { headers: this.headers() }
    );
  }

  accepterInscription(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.BASE}/votes/accepter-inscription/${id}/`,
      {},
      { headers: this.headers() }
    );
  }

  refuserInscription(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.BASE}/votes/refuser-inscription/${id}/`,
      {},
      { headers: this.headers() }
    );
  }

  // ══════════════════════════════════════════════════════
  // VOTE
  // ══════════════════════════════════════════════════════

  voter(candidatId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.BASE}/votes/voter/`,
      { candidat: candidatId },
      { headers: this.headers() }
    );
  }

  // ══════════════════════════════════════════════════════
  // RÉSULTATS
  // ══════════════════════════════════════════════════════

  getResultats(scrutinId: number): Observable<ResultatScrutin> {
    return this.http.get<ResultatScrutin>(
      `${this.BASE}/votes/resultats/${scrutinId}/`,
      { headers: this.headers() }
    );
  }

  // ── Helpers statiques ─────────────────────────────────

  static getStatut(scrutin: ScrutinAPI): 'en_cours' | 'planifie' | 'termine' | 'brouillon' {
    if (!scrutin.actif) return 'brouillon';
    const now   = new Date();
    const debut = new Date(scrutin.date_debut);
    const fin   = new Date(scrutin.date_fin);
    if (now < debut) return 'planifie';
    if (now > fin)   return 'termine';
    return 'en_cours';
  }

  static formatDate(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('fr-FR');
  }

  static getNomAffiche(user: UserProfile): string {
    if (user.first_name) {
      return user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.first_name;
    }
    return user.username;
  }

  static getInitialesUser(user: UserProfile): string {
    if (user.first_name) {
      const i1 = user.first_name[0] ?? '';
      const i2 = user.last_name?.[0] ?? '';
      return (i1 + i2).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  }
}
