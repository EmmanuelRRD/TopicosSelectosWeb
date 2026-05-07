from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .serializers import LoginCheck, NewUser

class LoginView(APIView):
    def post(self, request):
        # Recibimos lo que el usuario escribió en React
        user_input = request.data.get('username')
        pass_input = request.data.get('password')

        # Django revisa en la bd si coinciden (Evita inyección SQL)
        user = authenticate(username=user_input, password=pass_input)

        if user is not None:
            #Si todo sale bien mandamos los datos para crear la sesión
            serializer = LoginCheck(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            # si no funciona mandamos un 401
            return Response(
                {"error": "Contraseña o Usuario inválidos"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            '''
            # Example json 
            {
                "username": "admin",
                "password": "admin"
            }
            '''
            
class NewUserView(APIView):
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
        
class MyTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]