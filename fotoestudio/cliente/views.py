from rest_framework import viewsets
from .permissions import IsOwnerOrReadOnly
from rest_framework.permissions import IsAuthenticated
from .models import Cita
from fotografo.models import Paquete
from login.models import Usuario
from .serializers import CitaSerializer, PaqueteSerializer, FotografoSerializer, AgendaCitasSerializer, CitaUpdateSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
    
class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    def get_queryset(self):
        """
        Este método filtra las citas automáticamente 
        según el usuario que está haciendo la petición.
        """
        user = self.request.user
        
        if user.is_staff:# Si es admin deja pasar todos los datos
            return Cita.objects.all()
        
        if user.tipo_usuario == 'fotografo':# Fotografo solo las citas que tiene asignadas
            return Cita.objects.filter(fotografo=user)
        
        return Cita.objects.filter(cliente=user)# El cliente sus propias citas
    
    
    def get_serializer_class(self):
        
        if self.action in ['update', 'partial_update']:#Llama al upodate para la comprobacion
            return CitaUpdateSerializer
        return CitaSerializer

    @action(detail=False, methods=['get'])
    def agenda(self, request):
        from django.utils import timezone
        citas = Cita.objects.filter(fecha_cita__gte=timezone.now()).order_by('fecha_cita')
        
        serializer = AgendaCitasSerializer(citas, many=True)
        return Response(serializer.data)
    
class PaqueteViewSet(viewsets.ReadOnlyModelViewSet): #Solo lectura, sin ABC
    queryset = Paquete.objects.all()
    serializer_class = PaqueteSerializer
    
class FotografoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Usuario.objects.filter(tipo_usuario='Fotógrafo') #Solo muestra fotografos
    serializer_class = FotografoSerializer