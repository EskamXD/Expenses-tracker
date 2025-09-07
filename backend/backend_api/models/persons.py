from django.db import models


class Person(models.Model):
    name = models.CharField(max_length=100, unique=True)
    payer = models.BooleanField(default=False)
    owner = models.BooleanField(default=True)

    def __str__(self):
        return self.name
