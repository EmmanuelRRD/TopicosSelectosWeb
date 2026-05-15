from rest_framework import serializers
from .models import Usuario
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.permissions import AllowAny #Para no pedir el token

#Comfirmar si el usuario y contra correctas si no mandar un numero para marcar error creo era 200 y si si funciona mandar el id, tipo Usuario y  nombre

class NewUser(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['username', 'password', 'email', 'first_name', 'last_name', 'tipo_usuario', 'sexo']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        tipo = validated_data.get('tipo_usuario', 'cliente')#Si no se mando un tipo de usuario es cliente
        
        user = Usuario.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            tipo_usuario=tipo,
            sexo=validated_data.get('sexo', 'M')
        )
        
        if tipo == 'admin':#Si es de tipo admin le da staff automaticamente
            user.is_staff = True
            user.is_superuser = True
            user.save()
            
        return user
    
class LoginTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # ESTO METE LOS DATOS DENTRO DEL TOKEN (Lo que verás en JWT.io)
        token['username'] = user.username
        token['tipo_usuario'] = user.tipo_usuario
        token['nombre_completo'] = f"{user.first_name} {user.last_name}"

        return token

class UsuarioListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'email', 'first_name', 
            'last_name', 'tipo_usuario', 'is_staff', 'is_active'
        ]