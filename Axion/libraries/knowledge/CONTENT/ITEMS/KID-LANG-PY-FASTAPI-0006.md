---
kid: "KID-LANG-PY-FASTAPI-0006"
title: "Deployment Notes (FastAPI)"
content_type: "reference"
primary_domain: "["
secondary_domains:
  - "p"
  - "y"
  - "t"
  - "h"
  - "o"
  - "n"
  - ","
  - " "
  - "f"
  - "a"
  - "s"
  - "t"
  - "a"
  - "p"
  - "i"
  - "]"
industry_refs: []
stack_family_refs:
  - "frameworks"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "f"
  - "a"
  - "s"
  - "t"
  - "a"
  - "p"
  - "i"
  - ","
  - " "
  - "d"
  - "e"
  - "p"
  - "l"
  - "o"
  - "y"
  - "m"
  - "e"
  - "n"
  - "t"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/python/frameworks/fastapi/KID-LANG-PY-FASTAPI-0006.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Deployment Notes (FastAPI)

```markdown
# Deployment Notes (FastAPI)

## Summary
FastAPI is a modern, high-performance web framework for building APIs with Python. Deploying FastAPI applications requires careful consideration of production environments, including ASGI server selection, configuration, and scalability. This guide outlines best practices and configuration options for deploying FastAPI effectively.

## When to Use
- Deploying FastAPI applications to production environments.
- Configuring FastAPI applications for high-performance API workloads.
- Ensuring scalability and reliability for FastAPI-based microservices.

## Do / Don't

### Do:
- Use an ASGI server like `uvicorn` or `daphne` for production deployments.
- Configure environment variables for sensitive data like API keys and database credentials.
- Implement HTTPS for secure communication in production environments.

### Don't:
- Don't use the built-in development server (`uvicorn --reload`) in production.
- Don't hardcode sensitive information in your source code.
- Don't neglect monitoring and logging for deployed applications.

## Core Content

### 1. ASGI Server Configuration
FastAPI is built on the ASGI standard, which supports asynchronous request handling. Use a production-grade ASGI server like `uvicorn` or `daphne`.

#### Example: Running FastAPI with `uvicorn`
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```
- `app.main:app`: The path to your FastAPI application instance.
- `--host`: The host address (use `0.0.0.0` to make it accessible externally).
- `--port`: The port to serve the application.
- `--workers`: Number of worker processes to handle requests (adjust based on system resources).

### 2. Environment Variables
Store sensitive information like database URLs, API keys, and secret tokens in environment variables. Use libraries like `python-decouple` or `dotenv` to manage them.

#### Example: `.env` File
```plaintext
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=mysecretkey
```

#### Loading Environment Variables
```python
from decouple import config

DATABASE_URL = config("DATABASE_URL")
SECRET_KEY = config("SECRET_KEY")
```

### 3. HTTPS and Reverse Proxy
For production, use a reverse proxy like Nginx or Apache to handle HTTPS and forward requests to the ASGI server.

#### Example: Nginx Configuration
```nginx
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 4. Scalability with Process Managers
Use a process manager like `systemd` or `gunicorn` to manage application lifecycle and scale worker processes.

#### Example: `systemd` Service File
```plaintext
[Unit]
Description=FastAPI Application
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/app
ExecStart=/usr/local/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

### 5. Monitoring and Logging
Implement monitoring tools like Prometheus or New Relic to track application performance. Configure logging to capture errors and access logs.

#### Example: Logging Configuration
```python
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

logger.info("Application started")
```

## Links
- **FastAPI Documentation**: Official documentation for FastAPI, including deployment recommendations.
- **ASGI Specification**: Details on the ASGI standard used by FastAPI.
- **Uvicorn Documentation**: Reference for configuring the Uvicorn ASGI server.
- **Nginx Reverse Proxy Guide**: Best practices for setting up Nginx as a reverse proxy.

## Proof / Confidence
- FastAPI is widely adopted for its performance, with benchmarks showing it as one of the fastest Python frameworks (source: TechEmpower benchmarks).
- ASGI is the industry standard for asynchronous Python web applications, ensuring compatibility with modern servers.
- Best practices for deployment, including reverse proxies and process managers, are supported by industry leaders and used in production environments globally.
```
