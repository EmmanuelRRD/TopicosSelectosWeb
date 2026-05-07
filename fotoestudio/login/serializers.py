from rest_framework import serializers
from .models import Usuario

#Comfirmar si el usuario y contra correctas si no mandar un numero para marcar error creo era 200 y si si funciona mandar el id, tipo Usuario y  nombre

class LoginCheck(serializers.ModelSerializer): 
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'tipo_usuario']
