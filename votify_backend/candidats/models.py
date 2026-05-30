from django.db import models

from scrutins.models import Scrutin


class Candidat(models.Model):

    # scrutin auquel appartient le candidat
    scrutin = models.ForeignKey(
        Scrutin,
        on_delete=models.CASCADE,
        related_name='candidats'
    )

    # nom du candidat
    nom = models.CharField(max_length=255)

    # description / programme
    description = models.TextField()

    # photo du candidat
    photo = models.ImageField(
        upload_to='candidats/',
        blank=True,
        null=True
    )

    # date création
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):

        return self.nom

# Create your models here.
