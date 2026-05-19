from django.contrib.auth import get_user_model
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q  # búsquedas complejas
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    LoginTokenSerializer,
    NewUser,
    UsuarioListSerializer,  # <-- Importamos el correcto
)

User = get_user_model()

class UsuariosViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = UsuarioListSerializer

    # 🌟 Sobreescribimos get_queryset para aplicar los filtros dinámicamente
    def get_queryset(self):
        # Iniciamos con la consulta base ordenada
        queryset = User.objects.all().order_by('-id')

        # 1. Filtro por Rol (?tipo_usuario=...)
        tipo_usuario = self.request.query_params.get('tipo_usuario', None)
        if tipo_usuario and tipo_usuario != 'todos':
            queryset = queryset.filter(tipo_usuario__iexact=tipo_usuario)

        # 2. Filtro por Barra de Búsqueda (?search=...)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )

        return queryset

    # Tu método list ahora llamará a get_queryset() YA FILTRADO
    def list(self, request, *args, **kwargs):
        page_number = request.query_params.get('page', 1)
        page_size = request.query_params.get('size', 6) 
        
        # self.get_queryset() ahora trae la info filtrada por rol y búsqueda
        queryset_filtrado = self.get_queryset()
        paginator = Paginator(queryset_filtrado, page_size)
        
        try:
            page_obj = paginator.page(page_number)
        except PageNotAnInteger:
            page_obj = paginator.page(1)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)
            
        serializer = self.get_serializer(page_obj.object_list, many=True)
        
        return Response({
            'count': paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': page_obj.number,
            'next': page_obj.has_next(),
            'previous': page_obj.has_previous(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)
        
class NewUserView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        tipo_solicitado = request.data.get('tipo_usuario', 'cliente')
        
        if tipo_solicitado in ['admin', 'fotografo']:
            if not request.user.is_authenticated or not request.user.is_staff:
                return Response(
                    {"error": "No tienes permiso para crear usuarios de este tipo."},
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer = NewUser(data=request.data)
        if serializer.is_valid():
            # Tu serializador NewUser ya encripta la contraseña usando create_user() internamente.
            # Solo llamamos a save() y listo.
            serializer.save()
            return Response({"message": "Usuario creado con éxito"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = LoginTokenSerializer


class UsuarioListView(APIView):
    # Puedes usar IsAdminUser si quieres proteger la lista, o AllowAny para pruebas en local
    permission_classes = [AllowAny] 

    def get(self, request):
        # 1. Obtener parámetros de paginación
        page_number = request.query_params.get('page', 1)
        page_size = request.query_params.get('size', 10) 
        
        # 2. Query ordenado por ID descendente
        usuarios_queryset = User.objects.all().order_by('-id') 
        
        # 3. Paginación manual con el Paginator de Django
        paginator = Paginator(usuarios_queryset, page_size)
        
        try:
            page_obj = paginator.page(page_number)
        except PageNotAnInteger:
            page_obj = paginator.page(1)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)
            
        # 4. Usamos tu serializador real: UsuarioListSerializer
        serializer = UsuarioListSerializer(page_obj.object_list, many=True)
        
        # 5. Respuesta JSON estructurada
        return Response({
            'count': paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': page_obj.number,
            'next': page_obj.has_next(),
            'previous': page_obj.has_previous(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)