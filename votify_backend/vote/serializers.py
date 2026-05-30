from rest_framework import serializers

from .models import InscriptionScrutin, Vote


class InscriptionScrutinSerializer(serializers.ModelSerializer):

    class Meta:

        model = InscriptionScrutin

        fields = '__all__'

        read_only_fields = ['electeur', 'statut']


class VoteSerializer(serializers.ModelSerializer):

    class Meta:

        model = Vote

        fields = '__all__'

        read_only_fields = ['electeur']