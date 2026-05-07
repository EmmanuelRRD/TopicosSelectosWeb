from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from cliente.views import CitaViewSet, PaqueteViewSet, FotografoViewSet
from login.views import LoginView

router = routers.DefaultRouter()
router.register(r'citas', CitaViewSet)
router.register(r'paquetes', PaqueteViewSet)
router.register(r'fotografos', FotografoViewSet)


urlpatterns = [
    path('admin/', admin.site.urls),
    
    #Endpoints del API
    path('api/', include(router.urls)),
    path('api/login/', LoginView.as_view(), name = 'login'),
]