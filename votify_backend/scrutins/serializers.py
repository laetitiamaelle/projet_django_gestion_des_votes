from rest_framework import serializers

from .models import Scrutin


class ScrutinSerializer(serializers.ModelSerializer):

    class Meta:

        model = Scrutin

        fields = '__all__'

        read_only_fields = ['admin']