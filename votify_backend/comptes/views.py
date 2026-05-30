from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import (RegisterSerializer,UserSerializer,ChangePasswordSerializer)

# creer un compte
class RegisterView(generics.CreateAPIView):

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class ProfileView(generics.RetrieveAPIView):

    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
# changer le mot de passe a la premiere connexion

class ChangePasswordView(APIView):

    def post(self, request):

        serializer = ChangePasswordSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = request.user

            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']

            if not user.check_password(old_password):

                return Response(
                    {
                        'error': 'Ancien mot de passe incorrect'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(new_password)

            user.must_change_password = False

            user.save()

            return Response(
                {
                    'message': 'Mot de passe modifié avec succès'
                }
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .services import*
from django.core.mail import send_mail
from django.utils.crypto import get_random_string

from .models import DemandeAdmin, User
from .serializers import DemandeAdminSerializer
from .permissions import IsSuperAdmin

# creer un admin
class CreerDemandeAdminView(generics.CreateAPIView):

    queryset = DemandeAdmin.objects.all()

    serializer_class = DemandeAdminSerializer

    permission_classes = []

#voir la liste des demande
class ListeDemandesAdminView(generics.ListAPIView):

    queryset = DemandeAdmin.objects.all()

    serializer_class = DemandeAdminSerializer

    permission_classes = [IsSuperAdmin]

# valider une demamde
class ValiderDemandeAdminView(APIView):

    permission_classes = [IsSuperAdmin]

    def post(self, request, pk):

        demande = DemandeAdmin.objects.get(id=pk)

        password = generate_password()

        utilisateur = User.objects.create_user(
            username=demande.email,
            email=demande.email,
            password=password,
            role='admin',
            telephone=demande.telephone,
            cni=demande.cni
        )

        demande.statut = 'acceptee'
        demande.save()

        send_mail(
            subject='Compte administrateur Votify',
            message=f'''
Bonjour {demande.nom},

Votre demande administrateur a été acceptée sur l'app votify.
vous pouvez desormais creer et gerer vos scrutins.

Email : {demande.email}

Mot de passe : {password}

Veuillez modifier votre mot de passe après connexion.
''',
            from_email='laetitiamaelle740@gmail.com',
            recipient_list=[demande.email],
            fail_silently=False
        )

        return Response({
            'message': 'Compte administrateur créé avec succès'
        })