---
kid: "KID-LANGDJAN-CHECK-0001"
title: "Django Production Readiness Checklist"
type: "checklist"
pillar: "LANGUAGES_AND_LIBRARIES"
domains:
  - "django"
subdomains: []
tags:
  - "django"
  - "checklist"
maturity: "reviewed"
use_policy: "pattern_only"
executor_access: "internal_and_external"
license: "internal_owned"
allowed_excerpt:
  max_words: 0
  max_lines: 0
supersedes: ""
deprecated_by: ""
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Django Production Readiness Checklist

# Django Production Readiness Checklist

## Summary
This checklist ensures your Django application is ready for production deployment by addressing security, performance, scalability, and maintainability. Following these steps will help prevent common issues and ensure your application runs reliably in a production environment.

## When to Use
Use this checklist when preparing to deploy a Django application to production for the first time or when performing major upgrades or migrations. It is also applicable prior to scaling your application or moving to a new hosting provider.

## Do / Don't

### Do:
1. **Do configure `ALLOWED_HOSTS`**: Define the domains your application should respond to, preventing Host Header attacks.
2. **Do set `DEBUG = False`**: Disable debug mode to avoid exposing sensitive information in error pages.
3. **Do use a WSGI/ASGI server**: Deploy Django behind a production-grade server like Gunicorn, uWSGI, or Daphne for performance and reliability.
4. **Do use environment variables for secrets**: Store sensitive data like database credentials and API keys securely in environment variables.
5. **Do enable HTTPS**: Use SSL/TLS certificates to encrypt traffic and protect user data.

### Don't:
1. **Don't use SQLite in production**: Switch to a robust database like PostgreSQL or MySQL for better performance and scalability.
2. **Don't hardcode secrets in settings.py**: Avoid exposing sensitive information in your codebase.
3. **Don't ignore static and media file handling**: Ensure proper configuration for serving static files and user-uploaded media.
4. **Don't neglect logging and monitoring**: Always set up logging and monitoring to track application health and debug issues.
5. **Don't rely on default Django settings**: Review and customize settings for security and performance.

## Core Content

### Security
1. **Set `ALLOWED_HOSTS`**:
   - Add your production domain(s) to the `ALLOWED_HOSTS` setting in `settings.py`.
   - Example: `ALLOWED_HOSTS = ['example.com', 'www.example.com']`
   - **Rationale**: Prevents Host Header attacks.

2. **Set `DEBUG = False`**:
   - Update `settings.py` to disable debug mode: `DEBUG = False`.
   - **Rationale**: Debug mode exposes sensitive information in error pages.

3. **Secure secrets with environment variables**:
   - Use libraries like `python-decouple` or `django-environ` to manage secrets.
   - Example: `DATABASE_URL = os.getenv('DATABASE_URL')`
   - **Rationale**: Prevents accidental exposure of sensitive data in the codebase.

4. **Enable HTTPS**:
   - Use a reverse proxy like Nginx or Apache to terminate SSL/TLS.
   - Redirect all HTTP traffic to HTTPS.
   - **Rationale**: Encrypts communication between users and your application.

### Performance
1. **Use a production-grade WSGI/ASGI server**:
   - Install and configure Gunicorn, uWSGI, or Daphne.
   - Example: `gunicorn myproject.wsgi:application --bind 0.0.0.0:8000`
   - **Rationale**: Handles concurrent requests efficiently.

2. **Optimize database queries**:
   - Use Django’s `select_related` and `prefetch_related` to reduce query count.
   - Enable database connection pooling via libraries like `django-db-geventpool`.
   - **Rationale**: Improves performance under high load.

3. **Configure caching**:
   - Use Redis or Memcached for caching.
   - Example: `CACHES = {'default': {'BACKEND': 'django.core.cache.backends.redis.RedisCache', 'LOCATION': 'redis://127.0.0.1:6379/1'}}`
   - **Rationale**: Reduces database load and speeds up responses.

### Scalability
1. **Use a robust database**:
   - Migrate from SQLite to PostgreSQL or MySQL.
   - Example: Update `DATABASES` in `settings.py` to use PostgreSQL.
   - **Rationale**: Handles larger datasets and concurrent connections better.

2. **Set up static and media file hosting**:
   - Use a CDN or object storage like AWS S3 for serving static and media files.
   - Example: `DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'`
   - **Rationale**: Offloads file serving from your application server.

### Monitoring and Logging
1. **Enable logging**:
   - Configure Django’s logging framework in `settings.py`.
   - Example: 
     ```python
     LOGGING = {
         'version': 1,
         'handlers': {'file': {'level': 'ERROR', 'class': 'logging.FileHandler', 'filename': '/var/log/django/error.log'}},
         'loggers': {'django': {'handlers': ['file'], 'level': 'ERROR', 'propagate': True}},
     }
     ```
   - **Rationale**: Tracks errors and application events.

2. **Set up monitoring**:
   - Use tools like New Relic, Datadog, or Prometheus to monitor performance and uptime.
   - **Rationale**: Helps identify and resolve issues proactively.

### Backup and Recovery
1. **Automate database backups**:
   - Schedule regular backups using tools like pg_dump or mysqldump.
   - Store backups in a secure location (e.g., AWS S3).
   - **Rationale**: Protects against data loss.

2. **Test recovery procedures**:
   - Periodically test database restoration and file recovery.
   - **Rationale**: Ensures backups are usable during emergencies.

## Links
1. [Django
