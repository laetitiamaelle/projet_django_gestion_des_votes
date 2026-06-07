from django.urls import path
from .views import *

urlpatterns = [
    # Électeur
    path('inscription/',                    InscriptionScrutinView.as_view()),
    path('mes-inscriptions/',               MesInscriptionsView.as_view()),
    path('voter/',                          VoterView.as_view()),

    # Admin
    path('inscriptions-attente/',           InscriptionsEnAttenteView.as_view()),
    path('inscriptions-scrutin/<int:scrutin_id>/', InscriptionsScrutinView.as_view()),
    path('accepter-inscription/<int:pk>/',  AccepterInscriptionView.as_view()),
    path('refuser-inscription/<int:pk>/',   RefuserInscriptionView.as_view()),

    # Résultats
    path('resultats/<int:scrutin_id>/',     ResultatsScrutinView.as_view()),
]
