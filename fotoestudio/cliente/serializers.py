from rest_framework import serializers
from .models import Cita
from fotografo.models import Paquete
from login.models import Usuario

class PaqueteSerializer(serializers.ModelSerializer): # Mostrar los paquetes
    class Meta:
        model = Paquete
        fields = ['id', 'nombre','precio_paquete'] #Los datos que se quieren mostrar

class CitaSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.ReadOnlyField(source='cliente.username')
    paquete_nombre = serializers.ReadOnlyField(source='paquete.nombre')

    class Meta:
        model = Cita
        fields = '__all__'

class FotografoSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'tipo_usuario']