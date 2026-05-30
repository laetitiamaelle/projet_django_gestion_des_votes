from django.urls import path

from .views import *


urlpatterns = [

    path(
        'inscription/',
        InscriptionScrutinView.as_view()
    ),

    path(
        'inscriptions-attente/',
        InscriptionsEnAttenteView.as_view()
    ),

    path(
        'accepter-inscription/<int:pk>/',
        AccepterInscriptionView.as_view()
    ),

    path(
        'voter/',
        VoterView.as_view()
    ),

    path(
        'resultats/<int:scrutin_id>/',
        ResultatsScrutinView.as_view()
    ),
]