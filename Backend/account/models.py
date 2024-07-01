from django.db import models
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
import datetime
from django.db.models.signals import post_save
from django.dispatch import receiver



# Create your models here.
class MyAccountManager(BaseUserManager):
    def create_user(self, first_name, email, phone_number, password=None, date_of_birth=None, profile_picture=None, user_type='patient', approval_status='PENDING'):
        if not email:
            raise ValueError('User must have an email address')
        if not phone_number:
            raise ValueError('User must have a phone number')

        user = self.model(
            email=self.normalize_email(email),
            first_name=first_name,
            phone_number=phone_number,
            date_of_birth=date_of_birth,
            profile_picture=profile_picture,
            user_type=user_type,
            approval_status=approval_status,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, first_name, email, phone_number, password, date_of_birth=None, profile_picture=None, user_type='admin', approval_status='APPROVED'):
        user = self.create_user(
            email=self.normalize_email(email),
            first_name=first_name,
            phone_number=phone_number,
            password=password,
            date_of_birth=date_of_birth,
            profile_picture=profile_picture,
            user_type=user_type,
            approval_status=approval_status,
        )
        user.is_active = True
        user.is_superuser = True
        user.is_email_verified = True
        user.is_staff = True
        user.save(using=self._db)
        return user

# Approval status choices should not include 'APPROVAL_' prefix, as it is already specified in the default value
APPROVAL_STATUS_CHOICES = [
    ('PENDING', 'Pending'),
    ('APPROVED', 'Approved'),
    ('REJECTED', 'Rejected'),
]

class User(AbstractBaseUser):
    USER_TYPE_CHOICES = [
        ('admin', 'Admin'),
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        
    ]
    gender_type_choices = [
        ('male', 'Male'),
        ('female', 'Female'),
    ]

    blood_group=[
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
    ]

    uid = models.UUIDField(unique=True, default=uuid.uuid4)
    username = models.CharField(max_length=50, blank=True)
    password = models.CharField(max_length=100,blank=True,null=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50, blank=True)
    gender = models.CharField(max_length=10, choices=gender_type_choices, default='male')
    phone_number = models.CharField(max_length=12, blank=True, null=True)
    email = models.EmailField(max_length=100, unique=True)
    blood_group = models.CharField(max_length=5, choices=blood_group, default='A+') 
    date_of_birth = models.DateField(null=True, blank=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='Patient')
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    approval_status = models.CharField(max_length=20,choices=APPROVAL_STATUS_CHOICES,default='PENDING')
    street = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=255, blank=True, null=True)
    is_id_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now_add=True)
    is_superuser = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone_number', 'first_name']

    objects = MyAccountManager()

    def __str__(self):
        return self.first_name

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, add_label):
        return True
    
    def is_doctor(self):
        return self.user_type == 'doctor'
    



@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        # Check user_type and create the corresponding profile instance
        if instance.is_doctor():
            Doctor.objects.create(user=instance)  # You can customize as needed
            Verification.objects.create(user=instance)

# Connect the signal receiver function
post_save.connect(create_profile, sender=User)



class Doctor(models.Model):
    SPECIALIZATION_CHOICES = [
        ('Cardiologist', 'Cardiologist'),
        ('Dermatologist', 'Dermatologist'),
        ('Neurologist', 'Neurologist'),
        ('Orthopedic Surgeon', 'Orthopedic Surgeon'),
        ('Ophthalmologist', 'Ophthalmologist'),
        ('Gastroenterologist', 'Gastroenterologist'),
        ('Endocrinologist', 'Endocrinologist'),
        ('Pulmonologist', 'Pulmonologist'),
        ('Nephrologist', 'Nephrologist'),
        ('Pediatrician', 'Pediatrician'),
        ('Psychiatrist', 'Psychiatrist'),
        ('General', 'General'),
        ('Rheumatologist', 'Rheumatologist'),
        ('Hematologist', 'Hematologist'),
        ('Urologist', 'Urologist'),
        ('Otolaryngologist', 'Otolaryngologist'),
        ('Radiologist', 'Radiologist'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name='doctor_user')
    specializations = models.CharField(max_length=30, choices=SPECIALIZATION_CHOICES, default='General')
    education = models.TextField(max_length=50,blank=True, null=True)
    years_of_experience = models.IntegerField(default=0)
    about_me = models.CharField(max_length=255, blank=True, null=True)
    Hospital=models.TextField(max_length=50, blank=True, null=True)
    consultaion_fees = models.DecimalField(max_digits=10, decimal_places=0, default=300)


class Verification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True,related_name='doc_verification')
    aadhar_file = models.FileField(upload_to='verification_documents/aadhar', blank=True, null=True)
    degree_certificate = models.FileField(upload_to='verification_documents/degree', blank=True, null=True)
    experience_certificate = models.FileField(upload_to='verification_documents/experience', blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"Verification for {self.user.first_name}"



class OTPModel(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    otp = models.IntegerField()
    timestamp = models.DateTimeField()

    def __str__(self):
        return f"{self.user.username} - {self.otp}"