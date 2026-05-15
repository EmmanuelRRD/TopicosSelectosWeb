from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from cliente.views import CitaViewSet, PaqueteViewSet as PaqueteClienteViewSet, FotografoViewSet
from fotografo.views import ProductoViewSet, PaqueteViewSet as PaqueteGestionViewSet, CalendarfoViewSet
from login.views import NewUserView, LoginView, UsuariosViewSet
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = routers.DefaultRouter()
router.register(r'citas', CitaViewSet, basename='cita')
router.register(r'paquetes-cliente', FotografoViewSet, basename='paquete-cliente')
router.register(r'fotografos', FotografoViewSet)

router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'paquetes-fotografo', PaqueteGestionViewSet, basename='paquete-fotografo')
router.register(r'calendario-fotografos', CalendarfoViewSet, basename='calendario-fotografo')

router.register(r'usuarios', UsuariosViewSet, basename='usuarios')

urlpatterns = [
    path('admin/', admin.site.urls),
    #Endpoints del API
    path('api/', include(router.urls)),
    path('registro/', NewUserView.as_view(), name='registro'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),# Renueva el token
    path('login/', LoginView.as_view(), name='token_obtain_pair'),# Genera el token
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)