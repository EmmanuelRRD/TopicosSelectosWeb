from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .serializers import LoginCheck

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
            # Example json 
            #{
            #    "username": "admin",
            #    "password": "admin"
            #}
            