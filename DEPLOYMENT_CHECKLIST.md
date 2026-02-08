# Production Deployment Release Checklist

## Overview
This checklist ensures all production requirements from Issue #3 have been met before deploying the Iron Logical Creator application.

## Pre-Deployment Verification

### ✅ Security Audit
- [x] **Zero dependency vulnerabilities**: Verified with `npm audit` - 0 vulnerabilities found
- [x] **CodeQL security scan passed**: 0 alerts found
- [x] **Authentication hardened**: Bcrypt with 12 rounds, JWT tokens
- [x] **XSS protection**: DOMPurify implementation
- [x] **SQL injection protection**: Parameterized queries throughout
- [x] **Rate limiting**: Configured for auth (5/15min) and API (100/15min)
- [x] **Security headers**: Helmet with CSP, HSTS, X-Frame-Options, etc.
- [x] **Input validation**: express-validator + DOMPurify sanitization
- [x] **HTTPS enforcement**: Configured for production mode

### ✅ Environment Configuration
- [x] **.env.example created**: All required variables documented
- [x] **Environment validation**: Required variables checked on startup
- [x] **Secrets management**: No secrets in code, all via environment variables
- [x] **Production/development separation**: Proper NODE_ENV handling

### ✅ Database & Backend
- [x] **PostgreSQL schema**: Migration scripts created (001_initial_schema.sql)
- [x] **Connection pooling**: Configured (min: 2, max: 10)
- [x] **Database models**: User, AccessRequest, Asset, ChatMessage
- [x] **Health checks**: `/health` (liveness) and `/ready` (readiness with DB check)
- [x] **Structured logging**: JSON format with configurable levels
- [x] **Error handling**: Graceful degradation and proper error responses

### ✅ API Endpoints
- [x] **Authentication**: Login, session check, access requests
- [x] **User operations**: Credits, assets, chat histories
- [x] **Admin operations**: User management, request approval/denial
- [x] **Health endpoints**: Liveness and readiness probes

### ✅ Cloudflare Compatibility
- [x] **Proxy headers**: X-Forwarded-For, CF-Connecting-IP, True-Client-IP
- [x] **Trust proxy setting**: Configurable via TRUST_PROXY env var
- [x] **HTTPS redirect**: Handles both proxy and non-proxy scenarios
- [x] **Security headers**: Compatible with Cloudflare proxy

### ✅ Documentation
- [x] **README updated**: Comprehensive production deployment guide
- [x] **SECURITY.md created**: Security practices and vulnerability reporting
- [x] **API documentation**: All endpoints documented
- [x] **Troubleshooting guide**: Common issues and solutions
- [x] **Release checklist**: This document

## Production Deployment Steps

### Step 1: Environment Setup
```bash
# Copy and configure environment variables
cp .env.example .env

# Edit .env with production values:
# - Set NODE_ENV=production
# - Change ADMIN_DEFAULT_PIN from default
# - Generate strong JWT_SECRET (64+ chars)
# - Generate strong SESSION_SECRET (32+ chars)
# - Configure DATABASE_URL
# - Set TRUST_PROXY=true if behind Cloudflare
# - Configure ALLOWED_ORIGINS
```

### Step 2: Generate Secure Secrets
```bash
# Generate JWT_SECRET (128 hex characters = 64 bytes)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate SESSION_SECRET (64 hex characters = 32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Database Setup
```bash
# Create database (on your PostgreSQL server)
createdb iron_logical_creator

# Run migrations
npm run migrate

# Verify database connection
# The server will test connection on startup
```

### Step 4: Install Dependencies
```bash
# Install all dependencies
npm install

# Run security audit
npm audit

# Expected output: "found 0 vulnerabilities"
```

### Step 5: Build Application
```bash
# Build frontend
npm run build

# Build backend
npm run build:server
```

### Step 6: Test Locally
```bash
# Start server
npm start

# In another terminal, test health endpoints:
curl http://localhost:3001/health
# Expected: {"status":"OK", ...}

curl http://localhost:3001/ready
# Expected: {"status":"READY","checks":{"database":"OK"}}
```

### Step 7: Deploy to Production
- Deploy built assets to your hosting platform
- Ensure environment variables are set
- Start the server with `npm start`
- Verify health checks are passing

### Step 8: Post-Deployment Verification
```bash
# Check health endpoint
curl https://api.yourdomain.com/health

# Check readiness (database connectivity)
curl https://api.yourdomain.com/ready

# Test login (with default admin PIN if not changed)
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"pin":"YOUR_ADMIN_PIN"}'

# Expected: {"success":true,"session":{...}}
```

## Security Hardening Verification

### Critical Security Checks
- [ ] Default admin PIN has been changed
- [ ] JWT_SECRET is at least 64 characters
- [ ] SESSION_SECRET is at least 32 characters
- [ ] DATABASE_URL uses SSL for remote connections (DB_SSL=true)
- [ ] ALLOWED_ORIGINS is set to production domain(s) only
- [ ] TRUST_PROXY is set correctly (true for Cloudflare, false otherwise)
- [ ] HTTPS is enabled and enforced
- [ ] No secrets committed to git (check with `git log -p`)
- [ ] npm audit shows 0 vulnerabilities

### Cloudflare Configuration (if applicable)
- [ ] SSL/TLS mode is "Full (strict)"
- [ ] Cloudflare cache rules configured:
  - Cache: `yourdomain.com/assets/*`
  - Do NOT cache: `yourdomain.com/api/*`
- [ ] Origin server has valid SSL certificate
- [ ] Real IP headers are being forwarded correctly

## Monitoring Setup

### Recommended Monitoring
1. **Health Checks**
   - Monitor `/health` endpoint (should always return 200)
   - Monitor `/ready` endpoint (indicates database connectivity)
   - Set up alerts for failures

2. **Error Tracking**
   - Configure centralized logging service
   - Set up error alerts for 5xx responses
   - Monitor authentication failures

3. **Performance Monitoring**
   - Track API response times
   - Monitor database query performance
   - Watch for slow queries (logged automatically)

4. **Security Monitoring**
   - Track failed login attempts
   - Monitor rate limit hits
   - Watch for suspicious patterns

## Rollback Plan

If issues are discovered after deployment:

1. **Immediate Steps**
   - Revert to previous version
   - Check logs for errors: `grep ERROR /path/to/logs`
   - Verify database connectivity

2. **Investigation**
   - Review recent changes
   - Check environment variables
   - Verify database migrations

3. **Recovery**
   - Fix identified issues
   - Run security audit: `npm audit`
   - Run CodeQL scan
   - Test in staging environment
   - Re-deploy with fixes

## Regular Maintenance

### Weekly
- [ ] Review server logs for errors
- [ ] Check database performance
- [ ] Monitor API response times

### Monthly
- [ ] Run `npm audit` and address vulnerabilities
- [ ] Review and update dependencies
- [ ] Check disk space and database size
- [ ] Review security logs for suspicious activity

### Quarterly
- [ ] Rotate JWT_SECRET and SESSION_SECRET
- [ ] Review and update security headers
- [ ] Audit user accounts and access
- [ ] Review and update documentation

## Support

For issues or questions:
- Review SECURITY.md for security-related concerns
- Check README.md for troubleshooting guide
- Review server logs for detailed error messages

## Verification Commands

```bash
# Check server is running
curl https://yourdomain.com/health

# Check database connectivity
curl https://yourdomain.com/ready

# Check npm audit
npm audit

# Check for secrets in git
git log -p | grep -i "secret\|password\|key" | grep -v ".example"

# Check environment variables are set
env | grep -E "JWT_SECRET|SESSION_SECRET|DATABASE_URL"
```

## Sign-Off

Before deploying to production, ensure:

- [ ] All items in this checklist are completed
- [ ] Security audit passed (0 vulnerabilities)
- [ ] CodeQL scan passed (0 alerts)
- [ ] Health checks are passing
- [ ] Documentation is up to date
- [ ] Team has reviewed and approved changes
- [ ] Rollback plan is understood and ready

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Approved By**: _______________

**Production Status**: READY FOR DEPLOYMENT ✅
