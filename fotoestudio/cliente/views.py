from rest_framework import viewsets
from .models import Cita
from fotografo.models import Paquete
from login.models import Usuario
from .serializers import CitaSerializer, PaqueteSerializer, FotografoSerializer


class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer
    
class PaqueteViewSet(viewsets.ReadOnlyModelViewSet): #Solo lectura, sin ABC
    queryset = Paquete.objects.all()
    serializer_class = PaqueteSerializer
    
class FotografoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Usuario.objects.filter(tipo_usuario='Fotógrafo') #Solo muestra fotografos
    serializer_class = FotografoSerializer