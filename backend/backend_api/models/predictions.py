from django.db import models


class ItemPrediction(models.Model):
    item_description = models.CharField(max_length=255, unique=True)
    frequency = models.PositiveIntegerField(default=0)

    def increment_frequency(self):
        self.frequency += 1
        self.save()

    def __str__(self):
        return f"{self.item_description}: {self.frequency} times"
