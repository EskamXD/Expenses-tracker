from rest_framework import viewsets
from backend_api.models import Person
from backend_api.serializers import PersonSerializer


class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer
