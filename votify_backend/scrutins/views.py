from rest_framework import generics

from .models import Scrutin

from .serializers import ScrutinSerializer

from .permissions import IsAdmin
from django_filters.rest_framework import DjangoFilterBackend


# création d’un scrutin
class CreerScrutinView(generics.CreateAPIView):

    serializer_class = ScrutinSerializer

    permission_classes = [IsAdmin]

    def perform_create(self, serializer):

        # admin connecté automatiquement enregistré
        serializer.save(admin=self.request.user)


# liste des scrutins créés par l’admin connecté
class MesScrutinsView(generics.ListAPIView):

    serializer_class = ScrutinSerializer

    permission_classes = [IsAdmin]

    def get_queryset(self):

        return Scrutin.objects.filter(
            admin=self.request.user
        )

# liste des scrutins publics
class ListeScrutinsPublicsView(generics.ListAPIView):

    serializer_class = ScrutinSerializer

    queryset = Scrutin.objects.filter(actif=True)

    filter_backends = [DjangoFilterBackend]

    filterset_fields = ['titre']

# détails d’un scrutin
class DetailScrutinView(generics.RetrieveAPIView):

    queryset = Scrutin.objects.all()

    serializer_class = ScrutinSerializer
# Create your views here.
