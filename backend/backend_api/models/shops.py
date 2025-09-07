from django.db import models


class RecentShop(models.Model):
    name = models.CharField(max_length=255, unique=True)
    last_used = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.name = self.name.strip().lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
