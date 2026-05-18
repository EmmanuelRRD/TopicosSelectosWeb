from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .serializers import NewUser, LoginTokenSerializer, UsuarioListSerializer
from rest_framework import viewsets, permissions
from .models import Usuario
          
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
            # 1. Creamos la instancia del usuario en memoria temporal
            usuario = serializer.save()
            
            # 2. 🔥 EXTRAEMOS LA CONTRASEÑA Y LA ENCRIPTAMOS DIRECTO A MYSQL 🔥
            password = request.data.get('password', None)
            if password:
                usuario.set_password(password) # <-- Esto genera el Hash de Django
                usuario.save()
                
            return Response({"message": "Usuario creado con éxito"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    '''
        Ejemplo de json entrada
        {
            "username": "elmango",
            "password": "elmango",
            "email": "el@mango.com",
            "first_name": "El",
            "last_name": "Mango",
            "tipo_usuario": "fotografo",
            "sexo": "M"
        }
        '''
        
class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = LoginTokenSerializer
'''
# Example json 
{
"username": "admin",
"password": "admin"
}
'''

class UsuariosViewSet(viewsets.ModelViewSet):
    serializer_class = UsuarioListSerializer
    
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        base_queryset = Usuario.objects.all().order_by('-id')
        
        tipo = self.request.query_params.get('tipo')
        if tipo:
            return base_queryset.filter(tipo_usuario=tipo)
        return base_queryset

    def perform_create(self, serializer):
        # Guarda la instancia inicial en memoria
        usuario = serializer.save()
        password = self.request.data.get('password', None)
        if password:
            usuario.save()

    def perform_update(self, serializer):
        usuario = serializer.save()
        password = self.request.data.get('password', None)
        if password:
            usuario.set_password(password) # <-- Si el admin le cambia la clave, también se encripta
            usuario.save()