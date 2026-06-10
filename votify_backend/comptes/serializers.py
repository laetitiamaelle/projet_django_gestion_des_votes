# comptes/serializers.py — ajouter le UserSerializer si pas encore présent
from rest_framework import serializers
from .models import User, DemandeAdmin
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


# comptes/serializers.py
from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    # On déclare explicitement les champs attendus depuis ton formulaire Angular
    first_name = serializers.CharField(required=True)
    telephone = serializers.CharField(required=True)
    cni = serializers.CharField(required=True)

    class Meta:
        model = User
        # On expose exactement ce que ton Angular envoie
        fields = ['first_name', 'email', 'telephone', 'cni']

    def create(self, validated_data):
        # 💡 On extrait l'email pour générer le username requis par AbstractUser
        email = validated_data['email']
        generated_username = email.split('@')[0]
        
        if User.objects.filter(username=generated_username).exists():
            import uuid
            generated_username = f"{generated_username}_{uuid.uuid4().hex[:4]}"

        # On injecte le username généré dans les données validées
        validated_data['username'] = generated_username

        #  On appelle la méthode create_user d'origine de ton modèle
        # en lui passant le dictionnaire complet. Ton système d'envoi d'e-mail va se déclencher tout seul.
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'telephone', 'is_active']
        read_only_fields = ['id', 'email', 'role', 'is_active']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)


class DemandeAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = DemandeAdmin
        fields = ['id', 'nom', 'email', 'telephone', 'cni', 'organisation', 'motif', 'statut', 'date_creation']
        read_only_fields = ['id', 'statut', 'date_creation']


# comptes/serializers.py

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Ce bloc ajoute les infos *à l'intérieur* du jeton JWT crypté
        token['role'] = user.role
        token['username'] = user.username
        token['must_change_password'] = user.must_change_password
        return token

    def validate(self, attrs):
        # Ce bloc modifie le corps de la réponse JSON renvoyée lors du POST /login
        data = super().validate(attrs)
        
        # On injecte l'objet 'user' attendu par ton code Angular !
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
            'is_superuser': self.user.is_superuser,
            'must_change_password': self.user.must_change_password
        }
        
        return data