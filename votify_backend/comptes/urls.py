from django.urls import path
from .views import (
    RegisterView, 
    CustomTokenObtainPairView,  # 🌟 ON IMPORTE TA NOUVELLE VUE ICI
    ProfileView, 
    ChangePasswordView, 
    CreerDemandeAdminView, 
    ListeDemandesAdminView, 
    ValiderDemandeAdminView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Inscription
    path('register/', RegisterView.as_view()),

    # 🌟 LOGIN JWT AVEC TON COMPTE ET TON RÔLE PERSONNALISÉ
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),

    # Rafraîchissement du token
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Profil et mot de passe
    path('profile/', ProfileView.as_view()),
    path('change-password/', ChangePasswordView.as_view()),
    
    # Demandes administratives
    path('demande-admin/', CreerDemandeAdminView.as_view()),
    path('liste-demandes-admin/', ListeDemandesAdminView.as_view()),
    path('valider-demande-admin/<int:pk>/', ValiderDemandeAdminView.as_view()),
]