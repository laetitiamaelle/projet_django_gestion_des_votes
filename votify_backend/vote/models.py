from django.db import models

from comptes.models import User

from scrutins.models import Scrutin

from candidats.models import Candidat


class InscriptionScrutin(models.Model):

    STATUS_CHOICES = (
        ('en_attente', 'En attente'),
        ('accepte', 'Accepté'),
        ('refuse', 'Refusé'),
    )

    # électeur inscrit
    electeur = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    # scrutin concerné
    scrutin = models.ForeignKey(
        Scrutin,
        on_delete=models.CASCADE,
        related_name='inscriptions'
    )

    # statut validation admin
    statut = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='en_attente'
    )

    date_inscription = models.DateTimeField(auto_now_add=True)

    class Meta:

        unique_together = ['electeur', 'scrutin']

    def __str__(self):

        return f"{self.electeur.username} - {self.scrutin.titre}"


class Vote(models.Model):

    # électeur qui vote
    electeur = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    # scrutin concerné
    scrutin = models.ForeignKey(
        Scrutin,
        on_delete=models.CASCADE
    )

    # candidat choisi
    candidat = models.ForeignKey(
        Candidat,
        on_delete=models.CASCADE
    )

    date_vote = models.DateTimeField(auto_now_add=True)

    class Meta:

        unique_together = ['electeur', 'scrutin']

    def __str__(self):

        return f"{self.electeur.username} a voté"

# Create your models here.
