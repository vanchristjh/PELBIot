# Troubleshooting & Support

This folder contains common issues, troubleshooting guides, and solutions.

## 📋 Contents

### Common Issues
- Database connection problems
- WebSocket connection issues
- Authentication failures
- Performance problems
- Build errors

### Troubleshooting Guides
- Step-by-step debugging
- Log analysis
- Error diagnosis
- Solution verification
- Escalation procedures

### FAQs
- Frequently asked questions
- Common configuration issues
- Best practices
- Tips and tricks
- Quick fixes

---

## 🔴 Common Issues & Solutions

### Database Connection Issues

**Problem:** Cannot connect to MySQL database
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solutions:**
1. Verify MySQL is running: `mysql --version`
2. Check credentials in .env file
3. Verify database exists: `mysql -u root -p` then `SHOW DATABASES;`
4. Check firewall rules
5. Verify network connectivity

---

### WebSocket Connection Issues

**Problem:** WebSocket connection fails
```
Error: WebSocket connection refused
```

**Solutions:**
1. Verify backend server is running
2. Check if port 5000 is open
3. Verify Socket.IO configuration
4. Check browser console for errors
5. Try hard refresh (Ctrl+Shift+R)

---

### Authentication Failures

**Problem:** Login fails or token expires
```
Error: 401 Unauthorized
```

**Solutions:**
1. Verify correct credentials
2. Check JWT secret in .env
3. Clear browser cookies/cache
4. Verify user exists in database
5. Check token expiration time

---

### Performance Issues

**Problem:** Application running slowly
**Solutions:**
1. Check database query performance
2. Review browser DevTools Performance tab
3. Check server CPU/memory usage
4. Optimize images and assets
5. Enable caching

---

### Build Errors

**Problem:** npm run build fails
**Solutions:**
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear npm cache: `npm cache clean --force`
3. Check Node.js version compatibility
4. Review error messages carefully
5. Check disk space availability

---

## 🔧 Debugging Tips

### Check Backend Logs
```bash
# View recent errors
tail -f backend.log

# Search for specific error
grep "ERROR" backend.log
```

### Check Frontend Console
```
Open DevTools (F12) → Console tab
Look for red error messages
```

### Check Database
```sql
-- Verify database connectivity
SELECT 1;

-- Check table status
SHOW TABLES;

-- Count records
SELECT COUNT(*) FROM panels;
```

### Test API Endpoints
```bash
# Test with curl
curl http://localhost:5000/api/panels

# Check with Postman or Insomnia
GET /api/panels
```

---

## 📞 Getting Help

1. **Check Documentation** - Search in docs/
2. **Read Error Messages** - Carefully read full error
3. **Check Logs** - Review application logs
4. **Search FAQ** - Look for similar issues
5. **Contact Support** - Escalate if needed

---

## 📊 Diagnostic Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MySQL version
mysql --version

# Check if ports are open
netstat -an | grep 5000
netstat -an | grep 3306

# Check disk space
df -h

# Check memory usage
free -h
```

---

## 📚 Related Documentation

- **Setup:** [`../setup/`](../setup/)
- **Architecture:** [`../architecture/`](../architecture/)
- **Deployment:** [`../deployment/`](../deployment/)
- **Testing:** [`../testing/`](../testing/)

---

**Last Updated:** October 29, 2025
