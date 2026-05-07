from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .serializers import NewUser, LoginTokenSerializer
          
class NewUserView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
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