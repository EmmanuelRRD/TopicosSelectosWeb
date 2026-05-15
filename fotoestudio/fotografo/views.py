from rest_framework import viewsets, permissions
from .models import Producto, Paquete, DetallePaquete
from cliente.models import Cita
from .serializers import (
    ProductoSerializer, 
    PaqueteSerializer,
    AgendaFotografoSerializer
)
from login.models import Usuario 

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Tomamos el usuario directamente del Token (request.user)
        # Y le asignamos un stock por defecto si no viene en el JSON
        serializer.save(
            creado_por=self.request.user,
            stock=self.request.data.get('stock', 0) 
        )

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