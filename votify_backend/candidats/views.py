from rest_framework import generics

from .models import Candidat

from .serializers import CandidatSerializer

from .permissions import IsAdmin


# ajouter candidat
class AjouterCandidatView(generics.CreateAPIView):

    serializer_class = CandidatSerializer

    permission_classes = [IsAdmin]


# liste candidats d’un scrutin
class ListeCandidatsScrutinView(generics.ListAPIView):

    serializer_class = CandidatSerializer

    def get_queryset(self):

        scrutin_id = self.kwargs['scrutin_id']

        return Candidat.objects.filter(
            scrutin_id=scrutin_id
        )


# modifier candidat
class ModifierCandidatView(generics.UpdateAPIView):

    queryset = Candidat.objects.all()

    serializer_class = CandidatSerializer

    permission_classes = [IsAdmin]


# supprimer candidat
class SupprimerCandidatView(generics.DestroyAPIView):

    queryset = Candidat.objects.all()

    permission_classes = [IsAdmin]

# Create your views here.
