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
    permission_classes = [AllowAny] # Cualquiera puede "intentar" registrarse

    def post(self, request):
        tipo_solicitado = request.data.get('tipo_usuario', 'cliente')
        
        if tipo_solicitado in ['admin', 'fotografo']:#Solo el admin los puede crear
            if not request.user.is_authenticated or not request.user.is_staff:
                return Response(
                    {"error": "No tienes permiso para crear usuarios de este tipo."},
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer = NewUser(data=request.data)
        if serializer.is_valid():
            serializer.save()
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
    queryset = Usuario.objects.all().order_by('-id') # Los más nuevos primero
    serializer_class = UsuarioListSerializer
    
    # REGLA DE ORO: Solo el Admin (is_staff) puede entrar a este ViewSet
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        # Opcional: Podrías permitir que el admin filtre por tipo 
        # ejemplo: /api/usuarios/?tipo=fotografo
        tipo = self.request.query_params.get('tipo')
        if tipo:
            return self.queryset.filter(tipo_usuario=tipo)
        return self.queryset