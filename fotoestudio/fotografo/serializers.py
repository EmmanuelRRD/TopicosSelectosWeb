from rest_framework import serializers
from .models import Producto, Paquete, DetallePaquete
from login.models import Usuario
from cliente.models import Cita

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'medida', 'precio']

class DetallePaqueteSerializer(serializers.ModelSerializer):
    # Esto trae los datos del producto (nombre, medida) en lugar de solo el ID
    producto_info = ProductoSerializer(source='producto', read_only=True)
    
    class Meta:
        model = DetallePaquete
        fields = ['producto_info', 'cantidad']

class PaqueteSerializer(serializers.ModelSerializer):
    # Usamos el related_name por defecto o el set de la relación inversa
    contenido = DetallePaqueteSerializer(source='detallepaquete_set', many=True, read_only=True)

    class Meta:
        model = Paquete
        fields = ['id', 'nombre', 'descripcion', 'precio_paquete', 'contenido']
        
class AgendaFotografoSerializer(serializers.ModelSerializer):
    # Traemos datos del cliente para que el fotógrafo sepa quién es
    cliente_nombre = serializers.ReadOnlyField(source='cliente.first_name')
    cliente_apellido = serializers.ReadOnlyField(source='cliente.last_name')
    paquete_nombre = serializers.ReadOnlyField(source='paquete.nombre')

    class Meta:
        model = Cita
        fields = [
            'id', 'fecha_cita', 'lugar', 'notas', 
            'precio_total', 'pagado', 
            'cliente_nombre', 'cliente_apellido', 'paquete_nombre'
        ]
        
