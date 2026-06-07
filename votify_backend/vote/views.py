from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status

from .models import InscriptionScrutin, Vote
from .serializers import InscriptionScrutinSerializer, VoteSerializer
from .permissions import IsElecteur, IsAdmin

from candidats.models import Candidat


# ── ÉLECTEUR ─────────────────────────────────────────────────

class InscriptionScrutinView(generics.CreateAPIView):
    """Électeur : s'inscrire à un scrutin."""
    serializer_class = InscriptionScrutinSerializer
    permission_classes = [IsElecteur]

    def perform_create(self, serializer):
        serializer.save(electeur=self.request.user)


class MesInscriptionsView(generics.ListAPIView):
    """Électeur : voir toutes ses propres inscriptions (tous statuts)."""
    serializer_class = InscriptionScrutinSerializer
    permission_classes = [IsElecteur]

    def get_queryset(self):
        return InscriptionScrutin.objects.filter(
            electeur=self.request.user
        ).select_related('electeur', 'scrutin')


class VoterView(generics.CreateAPIView):
    """Électeur : voter pour un candidat."""
    serializer_class = VoteSerializer
    permission_classes = [IsElecteur]

    def create(self, request, *args, **kwargs):
        candidat_id = request.data.get('candidat')

        try:
            candidat = Candidat.objects.get(id=candidat_id)
        except Candidat.DoesNotExist:
            return Response(
                {'error': 'Candidat introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )

        scrutin = candidat.scrutin

        # Vérifier inscription acceptée
        inscription = InscriptionScrutin.objects.filter(
            electeur=request.user,
            scrutin=scrutin,
            statut='accepte'
        ).exists()

        if not inscription:
            return Response(
                {'error': 'Inscription non validée'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Empêcher double vote
        if Vote.objects.filter(electeur=request.user, scrutin=scrutin).exists():
            return Response(
                {'error': 'Vous avez déjà voté'},
                status=status.HTTP_400_BAD_REQUEST
            )

        Vote.objects.create(
            electeur=request.user,
            scrutin=scrutin,
            candidat=candidat
        )

        return Response({'message': 'Vote effectué avec succès'})


# ── ADMIN ─────────────────────────────────────────────────────

class InscriptionsEnAttenteView(generics.ListAPIView):
    """Admin : voir les inscriptions en attente sur ses scrutins."""
    serializer_class = InscriptionScrutinSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return InscriptionScrutin.objects.filter(
            scrutin__admin=self.request.user,
            statut='en_attente'
        ).select_related('electeur', 'scrutin')


class InscriptionsScrutinView(generics.ListAPIView):
    """Admin : toutes les inscriptions d'un scrutin."""
    serializer_class = InscriptionScrutinSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        scrutin_id = self.kwargs['scrutin_id']
        return InscriptionScrutin.objects.filter(
            scrutin_id=scrutin_id,
            scrutin__admin=self.request.user
        ).select_related('electeur', 'scrutin')


class AccepterInscriptionView(generics.UpdateAPIView):
    queryset = InscriptionScrutin.objects.all()
    serializer_class = InscriptionScrutinSerializer
    permission_classes = [IsAdmin]

    def update(self, request, *args, **kwargs):
        inscription = self.get_object()
        inscription.statut = 'accepte'
        inscription.save()
        return Response({'message': 'Inscription acceptée'})


class RefuserInscriptionView(generics.UpdateAPIView):
    queryset = InscriptionScrutin.objects.all()
    serializer_class = InscriptionScrutinSerializer
    permission_classes = [IsAdmin]

    def update(self, request, *args, **kwargs):
        inscription = self.get_object()
        inscription.statut = 'refuse'
        inscription.save()
        return Response({'message': 'Inscription refusée'})


# ── RÉSULTATS ─────────────────────────────────────────────────

class ResultatsScrutinView(generics.ListAPIView):

    def get(self, request, scrutin_id):
        candidats = Candidat.objects.filter(scrutin_id=scrutin_id)
        total_votes = Vote.objects.filter(scrutin_id=scrutin_id).count()
        resultats = []

        for candidat in candidats:
            nombre_votes = Vote.objects.filter(candidat=candidat).count()
            pourcentage = round((nombre_votes / total_votes) * 100, 2) if total_votes > 0 else 0
            resultats.append({
                'candidat_id': candidat.id,
                'candidat':    candidat.nom,
                'votes':       nombre_votes,
                'pourcentage': pourcentage,
            })

        # Trier par votes décroissant
        resultats.sort(key=lambda x: x['votes'], reverse=True)

        return Response({
            'total_votes': total_votes,
            'resultats':   resultats,
        })
