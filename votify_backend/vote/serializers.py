from rest_framework import serializers
from .models import InscriptionScrutin, Vote


class InscriptionScrutinSerializer(serializers.ModelSerializer):

    # Champs lisibles pour l'affichage dans le tableau frontend
    electeur_username = serializers.CharField(
        source='electeur.username',
        read_only=True
    )
    electeur_email = serializers.EmailField(
        source='electeur.email',
        read_only=True
    )
    scrutin_titre = serializers.CharField(
        source='scrutin.titre',
        read_only=True
    )

    class Meta:
        model = InscriptionScrutin
        fields = [
            'id',
            'electeur',
            'electeur_username',
            'electeur_email',
            'scrutin',
            'scrutin_titre',
            'statut',
            'date_inscription',
        ]
        read_only_fields = ['id', 'electeur', 'date_inscription']


class VoteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Vote
        fields = ['id', 'electeur', 'scrutin', 'candidat', 'date_vote']
        read_only_fields = ['id', 'electeur', 'scrutin', 'date_vote']
