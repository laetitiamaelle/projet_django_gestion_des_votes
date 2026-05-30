from rest_framework import serializers

from .models import Candidat


class CandidatSerializer(serializers.ModelSerializer):

    class Meta:

        model = Candidat

        fields = '__all__'