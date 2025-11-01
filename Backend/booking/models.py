from django.db import models
from account.models import Doctor




class DoctorAvailability(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    day = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)
    is_cancelled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_available(self):
        return not self.is_booked
    def is_cancelled(self):
        return self.is_cancelled
    

class Transaction(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('REFUNDED', 'Refunded'),
    ]
    transaction_id = models.CharField(max_length=200, verbose_name="Transaction ID", unique=True, primary_key=True)
    payment_id = models.CharField(max_length=200, verbose_name="Payment ID")
    order_id = models.CharField(max_length=200, verbose_name="Order ID",null=True,blank=True)
    signature = models.CharField(max_length=500, verbose_name="Signature", blank=True, null=True)
    amount = models.IntegerField(verbose_name="Amount")
    doctor_id = models.CharField(max_length=200, verbose_name="Doctor ID")
    patient_id = models.CharField(max_length=200, verbose_name="Patient ID") 
    booked_date = models.DateField()
    booked_from_time = models.TimeField()
    booked_to_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True) 
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='COMPLETED')
    is_consultency_completed = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')




    def save(self, *args, **kwargs):
        if not self.transaction_id:
            last_transaction = Transaction.objects.order_by('-transaction_id').first()
            if last_transaction:
                last_id = int(last_transaction.transaction_id)
                self.transaction_id = str(last_id + 1)
            else:
                self.transaction_id = '121212'

        super().save(*args, **kwargs)

    def __str__(self):
        return str(self.transaction_id)
    

class TransactionCommission(models.Model):
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name = 'commission')
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.2)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    doctor_commission_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
 
    def save(self, *args, **kwargs): 
        self.commission_amount = self.transaction.amount * self.commission_rate
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Commission for Transaction {self.transaction.transaction_id}"    