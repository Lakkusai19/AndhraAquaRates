# Deployment Guide: Andhra Shrimp Price Hub

## 1. Local Development Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- PostgreSQL (or SQLite fallback for zero-dependency local runs)

### Step 1: Clone and Configure Environment
```bash
# Copy template environment files
cp .env.example .env
cp .env.example backend/.env
```

### Step 2: Backend Setup
```bash
# In project root
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run migrations
python backend/manage.py migrate

# Seed Andhra Pradesh master data and verified demo buyers
python backend/manage.py seed_data

# Start backend server
python backend/manage.py runserver 0.0.0.0:8000
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 2. Docker & Docker Compose Deployment

A complete production-ready container stack is configured with PostgreSQL, Django/Gunicorn, and React/Nginx.

```bash
# Build and start all services in detached mode
docker-compose up --build -d

# Verify running containers
docker-compose ps

# View application logs
docker-compose logs -f
```

### Default Exposed Ports:
- Frontend Web & Reverse Proxy: `http://localhost:80` or `http://localhost:5173`
- Backend API & OpenAPI Docs: `http://localhost:8000/api/docs/`
- PostgreSQL Database: `localhost:5432`

---

## 3. Production HTTPS & Nginx Reverse Proxy
In production:
1. Terminate TLS/SSL at Nginx using Let's Encrypt certificates (`certbot`).
2. Set `DJANGO_DEBUG=False`.
3. Set `DJANGO_ALLOWED_HOSTS=andhrashrimphub.com,api.andhrashrimphub.com`.
4. Run Gunicorn behind Nginx with 3 to 4 worker processes.
5. Set `CORS_ALLOWED_ORIGINS=https://andhrashrimphub.com`.
6. Configure automated daily PostgreSQL backups:
   ```bash
   pg_dump -U postgres -d shrimphub_db -F c -b -v -f /backups/shrimphub_$(date +%Y%m%d).dump
   ```
