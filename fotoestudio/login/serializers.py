from rest_framework import serializers
from .models import Usuario

#Comfirmar si el usuario y contra correctas si no mandar un numero para marcar error creo era 200 y si si funciona mandar el id, tipo Usuario y  nombre

class LoginCheck(serializers.ModelSerializer): 
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'tipo_usuario']

class NewUser(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['username', 'password', 'email', 'first_name', 'last_name', 'tipo_usuario', 'sexo']

    def create(self, validated_data):
        user = Usuario.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],#Con el uso del create solito encripta la contraseña
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            tipo_usuario=validated_data.get('tipo_usuario', 'cliente'), #Como es para clientes ponemos esa por defecto
            sexo=validated_data.get('sexo', 'N')
        )
        return user
    
        
    
    