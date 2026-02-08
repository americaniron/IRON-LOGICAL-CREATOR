# Run and deploy your AI Studio app

This contains everything you need to run your app locally and deploy to production.

View your app in AI Studio: https://ai.studio/apps/drive/17OKpCtHggllIry6HPQ5MNCAQ908CvXY5

## Quick Start - Development Mode

**Prerequisites:**  Node.js (v18 or higher), PostgreSQL

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Update database credentials and other settings
   - For development, you can use a local PostgreSQL instance

3. **Set up the database:**
   ```bash
   # Create the database (using psql or your preferred tool)
   createdb iron_logical_creator
   
   # Run migrations
   npm run migrate
   ```

4. **Run the app in development mode:**
   ```bash
   # Run both frontend and backend
   npm run dev:all
   
   # Or run them separately:
   # Terminal 1 - Backend server
   npm run dev:server
   
   # Terminal 2 - Frontend
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health check: http://localhost:3001/health

6. **Default admin credentials:**
   - PIN: `01970` (Change this in production!)

## Production Deployment

### Prerequisites

- Node.js v18 or higher
- PostgreSQL 14 or higher
- Cloudflare account (recommended for proxy/CDN)
- Domain with SSL/TLS certificate

### Step 1: Environment Configuration

1. **Create `.env` file with production values:**

```bash
# Copy example and edit
cp .env.example .env
```

2. **Required environment variables for production:**

```env
NODE_ENV=production
APP_ENV=production
PORT=3001

# Database - Use your production PostgreSQL credentials
DATABASE_URL=postgresql://username:password@your-db-host:5432/iron_logical_creator
DB_SSL=true

# Security - Generate strong random secrets!
JWT_SECRET=<64+ character random string>
SESSION_SECRET=<32+ character random string>
BCRYPT_ROUNDS=12

# CORS - Set to your production domain
ALLOWED_ORIGINS=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Proxy - Enable when behind Cloudflare
TRUST_PROXY=true

# URLs
BASE_URL=https://api.yourdomain.com
PUBLIC_URL=https://yourdomain.com

# Logging
LOG_LEVEL=info

# Admin - CHANGE DEFAULT PIN!
ADMIN_DEFAULT_PIN=<your-secure-pin>
ADMIN_DEFAULT_NAME=COMMANDER_Z
ADMIN_INITIAL_CREDITS=999999
```

3. **Generate secure secrets:**

```bash
# Generate JWT_SECRET (64 bytes = 128 hex chars)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate SESSION_SECRET (32 bytes = 64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Database Setup

1. **Create production database:**

```bash
# On your database server
createdb iron_logical_creator
```

2. **Run migrations:**

```bash
npm run migrate
```

3. **Verify database connectivity:**

```bash
# The server will test the connection on startup
npm run server
# Look for "✅ Database connection successful"
```

### Step 3: Build the Application

```bash
# Build frontend
npm run build

# Build backend
npm run build:server
```

### Step 4: Start the Server

```bash
# Run migrations and start server
npm start
```

### Step 5: Health Checks

Verify that the application is running correctly:

```bash
# Liveness check
curl http://localhost:3001/health

# Readiness check (verifies database connectivity)
curl http://localhost:3001/ready
```

**Expected responses:**

- `/health` - Returns `200 OK` if the server is running
- `/ready` - Returns `200 OK` if the server can connect to the database

### Step 6: Cloudflare Configuration

When deploying behind Cloudflare:

1. **Enable Trust Proxy:**
   ```env
   TRUST_PROXY=true
   ```

2. **Cloudflare SSL/TLS Mode:**
   - Set to "Full (strict)" for end-to-end encryption
   - Ensure your origin server has a valid SSL certificate

3. **Cloudflare Page Rules (optional):**
   - Cache static assets: `yourdomain.com/assets/*`
   - Do NOT cache: `yourdomain.com/api/*`

4. **Cloudflare Headers:**
   - The server automatically handles: `X-Forwarded-For`, `X-Forwarded-Proto`, `CF-Connecting-IP`, `True-Client-IP`

### Step 7: Reverse Proxy Configuration (Optional)

If using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend static files
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

## Production Checklist

Before deploying to production, ensure you have:

### Security

- [ ] Changed `ADMIN_DEFAULT_PIN` from default value
- [ ] Generated strong random values for `JWT_SECRET` (min 64 chars) and `SESSION_SECRET` (min 32 chars)
- [ ] Set `NODE_ENV=production`
- [ ] Enabled database SSL (`DB_SSL=true`) for remote connections
- [ ] Configured `ALLOWED_ORIGINS` to production domain(s)
- [ ] Set `TRUST_PROXY=true` if behind Cloudflare/reverse proxy
- [ ] Verified `.env` file is in `.gitignore` and NOT committed
- [ ] Reviewed and understood `SECURITY.md`
- [ ] Run `npm audit` and addressed any vulnerabilities

### Database

- [ ] Database is created and accessible
- [ ] Migrations have been run successfully
- [ ] Database credentials are secure (not default values)
- [ ] Connection pooling is configured appropriately
- [ ] Database backups are configured

### Infrastructure

- [ ] HTTPS/TLS is enabled
- [ ] Health check endpoints are accessible
- [ ] `/health` returns 200 OK
- [ ] `/ready` returns 200 OK (confirms database connectivity)
- [ ] Rate limiting is tested and appropriate
- [ ] CORS is configured correctly
- [ ] Cloudflare (or CDN) is configured if using

### Monitoring

- [ ] Logging is configured and centralized
- [ ] Error tracking is set up
- [ ] Performance monitoring is enabled
- [ ] Alerts are configured for critical issues

## API Endpoints

### Health & Status

- `GET /health` - Liveness probe (always returns OK if server is running)
- `GET /ready` - Readiness probe (checks database connectivity)
- `GET /api` - API information

### Authentication

- `POST /api/auth/login` - User login (requires `pin`)
- `GET /api/auth/session` - Check session validity
- `POST /api/auth/request-access` - Submit access request
- `GET /api/auth/request-status/:name` - Check access request status

### User Operations (requires authentication)

- `GET /api/user/credits` - Get current credits
- `POST /api/user/deduct-credits` - Deduct credits
- `GET /api/user/assets` - Get user's assets
- `POST /api/user/assets` - Add new asset
- `DELETE /api/user/assets/:id` - Delete asset
- `GET /api/user/chats` - Get all chat histories
- `GET /api/user/chats/:taskType` - Get chat history for specific task
- `POST /api/user/chats/:taskType` - Add message to chat

### Admin Operations (requires admin role)

- `GET /api/admin/requests` - Get all access requests
- `GET /api/admin/users` - Get all users
- `POST /api/admin/approve-request/:id` - Approve access request
- `POST /api/admin/deny-request/:id` - Deny access request
- `POST /api/admin/allocate-credits` - Add credits to user

## Dependency Audit

Run dependency audit regularly:

```bash
npm audit

# Fix automatically fixable vulnerabilities
npm audit fix

# For vulnerabilities that require manual intervention
npm audit fix --force
```

## Troubleshooting

### Database Connection Issues

1. Verify database is running and accessible
2. Check `DATABASE_URL` format: `postgresql://user:pass@host:port/dbname`
3. Test connection: `npm run migrate`
4. Check `/ready` endpoint: `curl http://localhost:3001/ready`

### Authentication Issues

1. Verify JWT_SECRET is set and consistent
2. Check token expiration (7 days default)
3. Review rate limiting (5 login attempts per 15 minutes)

### Cloudflare Issues

1. Ensure `TRUST_PROXY=true` is set
2. Verify SSL/TLS mode is "Full (strict)"
3. Check that API endpoints are not cached
4. Review Cloudflare firewall rules

### Build Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Rebuild server
cd server && rm -rf dist && cd .. && npm run build:server
```

## Support & Documentation

- See `SECURITY.md` for security best practices and vulnerability reporting
- Review `.env.example` for all available configuration options
- Check server logs for detailed error messages (structured JSON format)

## License

See LICENSE file for details.
