from django.db import models
from django.conf import settings
from fotografo.models import Paquete

class Cita(models.Model):
    # Relación con el Usuario (Cliente)
    # settings.AUTH_USER_MODEL apunta a tu modelo personalizado en login
    cliente = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='citas'
    )
    
    # Relación con el Paquete
    paquete = models.ForeignKey(
        Paquete, 
        on_delete=models.PROTECT, # No permite borrar el paquete si tiene citas
        related_name='citas'
    )
    
    # Datos financieros
    precio_total = models.DecimalField(max_digits=10, decimal_places=2)
    abono = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    pagado = models.BooleanField(default=False)
    
    # Datos de agenda
    fecha_cita = models.DateTimeField()
    
    lugar = models.CharField(max_length=255, default='Estudio Jerez')
    notas = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Cita {self.id} - {self.cliente.username} ({self.fecha_cita.date()})"

    def save(self, *args, **kwargs):
        if not self.precio_total and self.paquete:
            self.precio_total = self.paquete.precio_paquete
            
        # Lógica de pago automático
        if self.abono >= self.precio_total:
            self.pagado = True
        else:
            self.pagado = False # Por si bajan el abono después
            
        super().save(*args, **kwargs)