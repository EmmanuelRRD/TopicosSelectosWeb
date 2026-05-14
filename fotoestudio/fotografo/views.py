from rest_framework import viewsets, permissions
from .models import Producto, Paquete, DetallePaquete
from cliente.models import Cita
from .serializers import (
    ProductoSerializer, 
    PaqueteSerializer,
    AgendaFotografoSerializer
)
from login.models import Usuario 

class ProductoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Solo lectura: Clientes y Fotógrafos pueden ver los productos,
    pero no crearlos ni borrarlos desde la API pública.
    """
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [permissions.IsAuthenticated]

class PaqueteViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Solo lectura: Permite ver los paquetes con su 'contenido' anidado.
    """
    queryset = Paquete.objects.all()
    serializer_class = PaqueteSerializer
    permission_classes = [permissions.IsAuthenticated]

class CalendarfoViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AgendaFotografoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtramos: Citas donde el fotografo_id sea el del usuario actual
        return Cita.objects.filter(fotografo=self.request.user)