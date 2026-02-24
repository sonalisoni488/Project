# Deployment Guide

This guide covers deployment options for the Waste2Resource platform.

## Architecture Overview

The platform consists of three main services:
- **Backend API** (Node.js + Express + MongoDB)
- **Frontend** (React.js)
- **AI Service** (Python FastAPI)

## Environment Setup

### Backend Environment Variables

Create `.env` file in `backend/`:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/waste2resource

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Server
PORT=5000
NODE_ENV=production

# AI Service
AI_SERVICE_URL=http://localhost:8000
```

### Frontend Environment Variables

Create `.env` file in `frontend/`:

```bash
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_AI_SERVICE_URL=https://your-ai-service-domain.com
```

### AI Service Environment Variables

Create `.env` file in `ai-service/`:

```bash
HOST=0.0.0.0
PORT=8000
DEBUG=False

# Model Configuration
MODEL_PATH=models/
CLASSIFICATION_MODEL=waste_classifier.h5
PRICING_MODEL=pricing_model.pkl

# Waste Types and Pricing
WASTE_TYPES=["Plastic", "Metal", "Paper", "Textile", "E-waste", "Construction", "Glass", "Organic"]
BASE_PRICES={"Plastic": 0.5, "Metal": 2.0, "Paper": 0.3, "Textile": 0.8, "E-waste": 5.0, "Construction": 0.2, "Glass": 0.4, "Organic": 0.1}
```

## Deployment Options

### Option 1: Docker Deployment

#### Prerequisites
- Docker and Docker Compose installed
- All environment variables configured

#### Docker Compose Setup

Create `docker-compose.yml` in root directory:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: waste2resource-db
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    container_name: waste2resource-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/waste2resource?authSource=admin
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    volumes:
      - ./backend:/app
      - /app/node_modules

  ai-service:
    build: ./ai-service
    container_name: waste2resource-ai
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - ./ai-service:/app

  frontend:
    build: ./frontend
    container_name: waste2resource-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend
      - ai-service

volumes:
  mongodb_data:
```

#### Dockerfiles

**Backend Dockerfile** (`backend/Dockerfile`):

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

**AI Service Dockerfile** (`ai-service/Dockerfile`):

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Nginx Configuration** (`frontend/nginx.conf`):

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://backend:5000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

#### Deployment Commands

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Cloud Deployment

#### Backend (Heroku)

1. Install Heroku CLI
2. Create `Procfile` in backend/:
   ```
   web: npm start
   ```
3. Deploy:
   ```bash
   heroku create waste2resource-api
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   git subtree push --prefix backend heroku main
   ```

#### Frontend (Netlify/Vercel)

**Netlify:**
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables in Netlify dashboard

**Vercel:**
1. Install Vercel CLI
2. Run: `vercel --prod`
3. Configure environment variables

#### AI Service (PythonAnywhere/Render)

**Render:**
1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Option 3: Traditional Server Deployment

#### Prerequisites
- Server with Ubuntu 20.04+ or CentOS 8+
- Node.js 18+
- Python 3.9+
- MongoDB 6.0+
- Nginx (optional)

#### Backend Setup

```bash
# Clone repository
git clone <your-repo-url>
cd waste2resource/backend

# Install dependencies
npm install

# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name "waste2resource-api"

# Setup PM2 startup script
pm2 startup
pm2 save
```

#### AI Service Setup

```bash
cd ../ai-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install Gunicorn
pip install gunicorn

# Start with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Build for production
npm run build

# Serve with Nginx or Apache
# Copy build/ directory to web server root
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /var/www/waste2resource/build;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ai {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Database Setup

### MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster
3. Configure network access (allow all IPs for development)
4. Create database user
5. Get connection string and update environment variables

### Self-hosted MongoDB

```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and user
mongo
use waste2resource
db.createUser({
  user: "waste2user",
  pwd: "secure_password",
  roles: ["readWrite"]
})
```

## SSL/HTTPS Setup

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### Application Monitoring

- Use PM2 monitoring for Node.js app
- Set up log rotation
- Monitor system resources

### Health Checks

Add health check endpoints:
- Backend: `/api/health`
- AI Service: `/health`

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **Database Security**: Use strong passwords, limit access
3. **API Security**: Rate limiting, input validation
4. **HTTPS**: Always use SSL in production
5. **Firewall**: Configure properly, only open necessary ports

## Backup Strategy

1. **Database Backups**: Regular MongoDB backups
2. **File Backups**: Backup user uploads and models
3. **Code Backups**: Version control with tags

## Scaling Considerations

1. **Load Balancing**: Multiple backend instances
2. **Database Scaling**: Read replicas, sharding
3. **CDN**: For static assets and images
4. **Caching**: Redis for session storage and caching

## Troubleshooting

### Common Issues

1. **CORS Errors**: Configure allowed origins
2. **Database Connection**: Check connection string and network
3. **File Uploads**: Verify permissions and storage
4. **AI Service**: Check model files and dependencies

### Log Locations

- Backend: PM2 logs or application logs
- AI Service: Application logs or journalctl
- Nginx: `/var/log/nginx/`
- MongoDB: `/var/log/mongodb/`

## Performance Optimization

1. **Database Indexes**: Ensure proper indexes
2. **Image Optimization**: Compress and cache images
3. **API Caching**: Implement Redis caching
4. **Frontend**: Code splitting, lazy loading
