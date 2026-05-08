from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para que solo el creador de la cita pueda editarla.
    """
    def has_object_permission(self, request, view, obj):
        # Si la petición es de lectura (GET, HEAD, OPTIONS), permitimos.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Solo permitimos escribir (PATCH, PUT, DELETE) si el cliente es el usuario logueado.
        return obj.cliente == request.user