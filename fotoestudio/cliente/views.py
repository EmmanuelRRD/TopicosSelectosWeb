from rest_framework import viewsets, filters
from .permissions import IsOwnerOrReadOnly
from rest_framework.permissions import IsAuthenticated
from .models import Cita
from fotografo.models import Paquete
from login.models import Usuario
from .serializers import CitaSerializer, PaqueteSerializer, FotografoSerializer, AgendaCitasSerializer, CitaUpdateSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

class PaginacionEstandar(PageNumberPagination):
    page_size = 5 # Muestra 5 citas por página
    page_size_query_param = 'page_size'
    max_page_size = 100

class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    pagination_class = PaginacionEstandar
    filter_backends = [filters.SearchFilter]
    search_fields = ['lugar', 'notas', 'cliente__username', 'paquete__nombre']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Cita.objects.all().order_by('-id')
        if user.tipo_usuario == 'fotografo':
            return Cita.objects.filter(fotografo=user).order_by('-id')
        return Cita.objects.filter(cliente=user).order_by('-id')
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return CitaUpdateSerializer
        return CitaSerializer

    # ==========================================================
    # 🔥 EL FILTRO DE SEGURIDAD PARA LAS ALTAS (POST) 🔥
    # ==========================================================
    def perform_create(self, serializer):
        user = self.request.user
        
        if user.is_staff:
            # Si es ADMIN, Django respeta lo que venga en el JSON de React (guarda normal)
            serializer.save()
        else:
            # Si es CLIENTE, ignoramos lo que mande el JSON en 'cliente' 
            # y le inyectamos a la fuerza el usuario logueado extraído del Token JWT
            serializer.save(cliente=user)

    @action(detail=False, methods=['get'])
    def agenda(self, request):
        from django.utils import timezone
        citas = Cita.objects.filter(fecha_cita__gte=timezone.now()).order_by('fecha_cita')
        serializer = AgendaCitasSerializer(citas, many=True)
        return Response(serializer.data)
    
class PaqueteViewSet(viewsets.ReadOnlyModelViewSet): 
    queryset = Paquete.objects.all()
    serializer_class = PaqueteSerializer
    
class FotografoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Usuario.objects.filter(tipo_usuario='Fotógrafo') 
    serializer_class = FotografoSerializer