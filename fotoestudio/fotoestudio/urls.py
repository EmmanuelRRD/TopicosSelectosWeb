from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from cliente.views import CitaViewSet

router = routers.DefaultRouter()
router.register(r'citas', CitaViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 2. Endpoints de la API
    path('api/', include(router.urls)),
    
    
    
    
]