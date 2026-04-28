from rest_framework import serializers
from .models import Cita

class CitaSerializer(serializers.ModelSerializer):
    # Esto mostrará el nombre del cliente y del paquete en lugar de solo el ID
    cliente_nombre = serializers.ReadOnlyField(source='cliente.username')
    paquete_nombre = serializers.ReadOnlyField(source='paquete.nombre')

    class Meta (serializers.ModelSerializer):
        model = Cita
        fields = '__all__' # O puedes enlistar: ['id', 'cliente', 'paquete', 'fecha_cita', 'precio_total', 'pagado']