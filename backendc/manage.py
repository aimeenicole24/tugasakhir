#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from decouple import config  # Untuk membaca variabel dari file .env

def main():
    """Run administrative tasks."""
    # Set default settings module untuk Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thunderbolt_backend.settings')

    # Debugging tambahan untuk memastikan variabel lingkungan terbaca
    try:
        secret_key = config('DJANGO_SECRET_KEY', default='SECRET_KEY_NOT_FOUND')
        debug = config('DEBUG', default=False, cast=bool)
        allowed_hosts = config('ALLOWED_HOSTS', default='localhost').split(',')

        print(f"DEBUG: DJANGO_SECRET_KEY = {secret_key}")
        print(f"DEBUG: DEBUG = {debug}")
        print(f"DEBUG: ALLOWED_HOSTS = {allowed_hosts}")
    except Exception as e:
        print(f"ERROR: Gagal membaca file .env. Detail: {e}")
        sys.exit(1)  # Keluar dengan status error jika variabel penting tidak ditemukan

    # Jalankan utilitas manajemen Django
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
