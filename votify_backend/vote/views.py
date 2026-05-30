from rest_framework import generics

from rest_framework.response import Response

from rest_framework import status

from .models import InscriptionScrutin, Vote

from .serializers import (
    InscriptionScrutinSerializer,
    VoteSerializer
)

from .permissions import IsElecteur, IsAdmin

from candidats.models import Candidat


# inscription à un scrutin
class InscriptionScrutinView(generics.CreateAPIView):

    serializer_class = InscriptionScrutinSerializer

    permission_classes = [IsElecteur]

    def perform_create(self, serializer):

        serializer.save(
            electeur=self.request.user
        )


# voir inscriptions en attente
class InscriptionsEnAttenteView(generics.ListAPIView):

    serializer_class = InscriptionScrutinSerializer

    permission_classes = [IsAdmin]

    queryset = InscriptionScrutin.objects.filter(
        statut='en_attente'
    )


# accepter inscription
class AccepterInscriptionView(generics.UpdateAPIView):

    queryset = InscriptionScrutin.objects.all()

    serializer_class = InscriptionScrutinSerializer

    permission_classes = [IsAdmin]

    def update(self, request, *args, **kwargs):

        inscription = self.get_object()

        inscription.statut = 'accepte'

        inscription.save()

        return Response({
            'message': 'Inscription acceptée'
        })


# voter
class VoterView(generics.CreateAPIView):

    serializer_class = VoteSerializer

    permission_classes = [IsElecteur]

    def create(self, request, *args, **kwargs):

        candidat_id = request.data.get('candidat')

        candidat = Candidat.objects.get(id=candidat_id)

        scrutin = candidat.scrutin

        # vérifier inscription acceptée
        inscription = InscriptionScrutin.objects.filter(
            electeur=request.user,
            scrutin=scrutin,
            statut='accepte'
        ).exists()

        if not inscription:

            return Response(
                {
                    'error': 'Inscription non validée'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # empêcher double vote
        deja_vote = Vote.objects.filter(
            electeur=request.user,
            scrutin=scrutin
        ).exists()

        if deja_vote:

            return Response(
                {
                    'error': 'Vous avez déjà voté'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        Vote.objects.create(
            electeur=request.user,
            scrutin=scrutin,
            candidat=candidat
        )

        return Response({
            'message': 'Vote effectué avec succès'
        })


# resultat

# résultats d’un scrutin
class ResultatsScrutinView(generics.ListAPIView):

    def get(self, request, scrutin_id):

        candidats = Candidat.objects.filter(
            scrutin_id=scrutin_id
        )

        resultats = []

        total_votes = Vote.objects.filter(
            scrutin_id=scrutin_id
        ).count()

        for candidat in candidats:

            nombre_votes = Vote.objects.filter(
                candidat=candidat
            ).count()

            pourcentage = 0

            if total_votes > 0:

                pourcentage = (
                    nombre_votes / total_votes
                ) * 100

            resultats.append({

                'candidat': candidat.nom,

                'votes': nombre_votes,

                'pourcentage': round(
                    pourcentage,
                    2
                )
            })

        return Response(resultats)

# Create your views here.
