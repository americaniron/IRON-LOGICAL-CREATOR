# Security Policy

## Reporting Security Vulnerabilities

The Iron Logical Creator team takes security seriously. We appreciate your efforts to responsibly disclose any security vulnerabilities you may find.

### How to Report a Security Vulnerability

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please report security vulnerabilities by:

1. **Email**: Send a detailed report to the repository maintainer
2. **Include**: 
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Updates**: We will send you regular updates about our progress
- **Credit**: We will credit you for your discovery in our release notes (unless you prefer to remain anonymous)

## Security Assumptions and Best Practices

### Authentication & Authorization

- **PIN-based authentication**: The system uses PIN codes for user authentication, which are hashed using bcrypt with 12 rounds
- **JWT tokens**: Session tokens are signed with a secret key and expire after 7 days
- **Role-based access**: Admin and user roles are enforced at the API level
- **Rate limiting**: Authentication endpoints are rate-limited to prevent brute force attacks (5 attempts per 15 minutes)

### Data Protection

- **Database**: All user data is stored in a PostgreSQL database with parameterized queries to prevent SQL injection
- **Passwords/PINs**: Never stored in plaintext; always hashed with bcrypt
- **Sensitive data**: API keys (Gemini, OpenAI, Grok) are never stored on the server; users provide them in the UI

### API Security

- **Input validation**: All user inputs are validated and sanitized on the server
- **Output encoding**: API responses are sanitized to prevent XSS attacks
- **CORS**: Cross-origin requests are restricted to allowed origins only
- **Rate limiting**: API endpoints are rate-limited (100 requests per 15 minutes by default)
- **Security headers**: CSP, HSTS, X-Frame-Options, and other security headers are enforced

### Cloudflare & Proxy Configuration

- **Proxy trust**: When `TRUST_PROXY=true`, the server trusts `X-Forwarded-For` and Cloudflare headers
- **Real IP**: The application correctly handles `CF-Connecting-IP` and `True-Client-IP` headers
- **HTTPS enforcement**: In production, HTTP requests are redirected to HTTPS

### Known Limitations

1. **LocalStorage Migration**: The application previously used localStorage for data persistence. During migration to SQL, ensure data is properly migrated and secured.

2. **Default Admin Credentials**: The default admin PIN is `01970`. **This MUST be changed in production** via the `ADMIN_DEFAULT_PIN` environment variable.

3. **API Keys**: External API keys (Gemini, OpenAI, Grok) are provided by users in the UI. The frontend stores these temporarily but they are NOT sent to our backend or stored in our database. Users should still treat these keys as sensitive.

4. **File Uploads**: Currently, the system stores URLs to generated content (images, videos) but does not handle file uploads directly. If file upload functionality is added, ensure:
   - File type validation
   - Size limits
   - Malware scanning
   - Secure storage with access controls

## Security Checklist for Production Deployment

### Before Deploying to Production

- [ ] Change `ADMIN_DEFAULT_PIN` to a secure value
- [ ] Generate strong random values for `JWT_SECRET` (min 64 characters) and `SESSION_SECRET` (min 32 characters)
- [ ] Set `NODE_ENV=production` and `APP_ENV=production`
- [ ] Enable database SSL (`DB_SSL=true`) for remote database connections
- [ ] Set `TRUST_PROXY=true` if behind Cloudflare or other reverse proxy
- [ ] Configure `ALLOWED_ORIGINS` to your production domain(s)
- [ ] Review and adjust rate limiting settings
- [ ] Ensure database credentials are secure and not default values
- [ ] Run dependency audit: `npm audit`
- [ ] Review all environment variables in `.env` file
- [ ] Ensure `.env` file is NOT committed to version control
- [ ] Test health and readiness endpoints
- [ ] Verify SQL connectivity and migrations
- [ ] Enable HTTPS/TLS in production
- [ ] Set up monitoring and alerting
- [ ] Configure logging to a centralized service
- [ ] Review CORS settings for your specific use case

### Regular Maintenance

- [ ] Keep dependencies up to date
- [ ] Run `npm audit` regularly and fix vulnerabilities
- [ ] Rotate JWT_SECRET and SESSION_SECRET periodically
- [ ] Review access logs for suspicious activity
- [ ] Monitor database performance and connection pool usage
- [ ] Review and update security headers as needed

## Secure Configuration Examples

### Minimum Secure JWT_SECRET

Generate a secure random string:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Database Connection with SSL

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
DB_SSL=true
```

### Production Environment Variables

See `.env.example` for a complete list of required environment variables with explanations.

## Contact

For security-related questions or concerns, please contact the repository maintainer.

---

Last updated: 2026-02-08
