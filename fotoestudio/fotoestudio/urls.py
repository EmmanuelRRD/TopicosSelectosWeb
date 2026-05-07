from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from cliente.views import CitaViewSet, PaqueteViewSet, FotografoViewSet
from login.views import LoginView, NewUserView
from login.views import MyTokenObtainPairView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


router = routers.DefaultRouter()
router.register(r'citas', CitaViewSet)
router.register(r'paquetes', PaqueteViewSet)
router.register(r'fotografos', FotografoViewSet)


urlpatterns = [
    path('admin/', admin.site.urls),
    
    #Endpoints del API
    path('api/', include(router.urls)),
    path('login/', LoginView.as_view(), name = 'login'),
    path('registro/', NewUserView.as_view(), name='registro'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),# Renueva el token
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),# Genera el token
]