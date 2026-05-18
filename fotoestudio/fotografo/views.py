from rest_framework import viewsets, permissions, filters
from .models import Producto, Paquete, DetallePaquete
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from login.models import Usuario 
from cliente.models import Cita
from .serializers import (
    ProductoSerializer, 
    PaqueteSerializer,
    AgendaFotografoSerializer
)

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all().order_by('-id')
    serializer_class = ProductoSerializer
    
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'medida']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)

class PaqueteViewSet(viewsets.ModelViewSet):
    queryset = Paquete.objects.all()
    serializer_class = PaqueteSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

class CalendarfoViewSet(viewsets.ModelViewSet):
    serializer_class = AgendaFotografoSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:#Permisos para el admin
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Cita.objects.all().order_by('fecha_cita')
        return Cita.objects.filter(fotografo=user).order_by('fecha_cita')