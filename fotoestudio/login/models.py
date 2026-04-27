from django.db import models
from django.contrib.auth.models import AbstractUser

class Usuario(AbstractUser):
    TIPOS_USUARIO = [
        ('admin', 'Administrador'),
        ('fotografo', 'Fotógrafo'),
        ('cliente', 'Cliente'),
    ]
    
    # Opciones para el sexo
    SEXO_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
        ('N', 'Prefiero no decirlo'),
    ]

    tipo_usuario = models.CharField(
        max_length=20, 
        choices=TIPOS_USUARIO, 
        default='cliente'
    )
    
    # Campo de Correo Obligatorio y único
    email = models.EmailField(unique=True)

    # --- NUEVOS CAMPOS ---
    fecha_nacimiento = models.DateField(null=False)
    
    # Usamos choices igual que con el tipo de usuario
    sexo = models.CharField(
        max_length=1, 
        choices=SEXO_CHOICES, 
        default='N'
    )

    def __str__(self):
        return f"{self.username} ({self.tipo_usuario})"