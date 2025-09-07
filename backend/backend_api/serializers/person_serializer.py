from rest_framework import serializers

from backend_api.models import Person


class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = ["id", "name", "payer", "owner"]
