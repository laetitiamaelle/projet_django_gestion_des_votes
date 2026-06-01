from rest_framework import serializers
from django.core.mail import send_mail

from .models import User,DemandeAdmin
from .services import generate_password


class RegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            'first_name',
            'email',
            'telephone',
            'cni'
        ]

    def create(self, validated_data):

        generated_password = generate_password()

        user = User.objects.create_user(
            username=validated_data['first_name'],
            email=validated_data['email'],
            password=generated_password,
            telephone=validated_data.get('telephone'),
            cni=validated_data.get('cni'),
            role='electeur',
            must_change_password=True
        )

        send_mail(
            subject='Bienvenue sur Votify',
            message=f'''
Bonjour {user.username},

Votre compte a été créé avec succès sur l'application votify.

Vos paramètres de connexion :

email : {user.email}
Mot de passe : {generated_password}

Veuillez modifier votre mot de passe après votre première connexion.


''',
            from_email='laetitiamaelle740@gmail.com',
            recipient_list=[user.email],
            fail_silently=False,
        )

        return user


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'username',
            'email',
            'telephone',
            'cni',
            'role',
            'must_change_password'
        ]


class ChangePasswordSerializer(serializers.Serializer):

    old_password = serializers.CharField()

    new_password = serializers.CharField()
class DemandeAdminSerializer(serializers.ModelSerializer):

    class Meta:

        model = DemandeAdmin

        fields = '__all__'

        read_only_fields = ['statut', 'date_creation']


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # On ajoute le username dans les données renvoyées lors de la connexion
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'username': self.user.username,  # 🌟 C'EST CETTE LIGNE QU'IL FAUT RAJOUTER
            'role': getattr(self.user, 'role', 'electeur'),
            'is_superuser': self.user.is_superuser
        }
        return data
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # C'est ici qu'on ajoute l'objet 'user' dans la réponse JSON !
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'role': getattr(self.user, 'role', 'electeur'),
            'is_superuser': self.user.is_superuser
        }
        return data