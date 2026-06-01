import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; 

@Injectable({
  providedIn: 'root'
})
export class SuperAdminService {

  private apiUrl = 'http://127.0.0.1:8000/api/auth';

  constructor(private http: HttpClient) {}

  getDemandes() {
    return this.http.get(
      `${this.apiUrl}/liste-demandes-admin/`
    );
  }

  validerDemande(id: number) {
    return this.http.post(
      `${this.apiUrl}/valider-demande-admin/${id}/`,
      {}
    );
  }

  refuserDemande(id: number) {
    return this.http.post(
      `${this.apiUrl}/refuser-demande-admin/${id}/`,
      {}
    );
  }
  // À l'intérieur de ton SuperAdminService
getAdmins(): Observable<any> {
  return this.http.get(`${this.apiUrl}/superadmin/admins/`);
}
getProfile() {
  return this.http.get(
    'http://127.0.0.1:8000/api/auth/profile/'
  );
}
creerAdminDirect(adminData: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/superadmin/creer-admin/`, adminData);
}
// Appelle le endpoint PATCH de Django pour modifier le statut
  modifierStatutAdmin(id: number, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/superadmin/admins/${id}/statut/`, { is_active: isActive });
  }
}