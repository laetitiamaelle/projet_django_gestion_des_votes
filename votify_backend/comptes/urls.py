from django.urls import path

from .views import *

from rest_framework_simplejwt.views import (TokenObtainPairView,
TokenRefreshView,
)

urlpatterns = [

    # Register
    path('register/', RegisterView.as_view()),

    # Login JWT
    path('login/', TokenObtainPairView.as_view()),

    # Refresh token
    path('refresh/', TokenRefreshView.as_view()),

    # Profile
    path('profile/', ProfileView.as_view()),

    # Change password
    path('change-password/', ChangePasswordView.as_view()),
    path(
    'demande-admin/',
    CreerDemandeAdminView.as_view()
),

path('liste-demandes-admin/',ListeDemandesAdminView.as_view()),

path('valider-demande-admin/<int:pk>/',ValiderDemandeAdminView.as_view()),
]