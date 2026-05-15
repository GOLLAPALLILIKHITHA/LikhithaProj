# Deployment Management Guide

## Better Admin Management Solutions

### 1. **Integrated Dashboard (Recommended)**
- Admin functionality is now integrated into the main app at `/dashboard`
- Only accessible to users with `role: 'admin'`
- No separate admin routes needed
- Same domain, same deployment

### 2. **Environment Variables for Admin Control**

```env
# Production Environment Variables
NODE_ENV=production
ADMIN_EMAILS=sivaprasad072611@gmail.com,admin2@example.com
ENABLE_ADMIN_FEATURES=true
```

### 3. **Database Management Scripts**

#### Create Admin User (Production)
```bash
# On your server
cd /path/to/your/app/backend
node scripts/createAdmin.js
```

#### List All Users
```bash
node scripts/listUsers.js
```

#### Promote User to Admin
```bash
node scripts/promoteUser.js email@example.com
```

### 4. **Deployment Options**

#### Option A: Single Domain (Recommended)
```
https://yourapp.com/              # Main app
https://yourapp.com/dashboard     # Admin dashboard (role-protected)
https://yourapp.com/login         # Login for both users and admins
```

#### Option B: Subdomain (If needed)
```
https://yourapp.com/              # Main app
https://admin.yourapp.com/        # Admin subdomain
```

#### Option C: Environment-based Access
```javascript
// In production, admin features are hidden unless user has admin role
const showAdminFeatures = user?.role === 'admin' && process.env.ENABLE_ADMIN_FEATURES === 'true';
```

### 5. **Production Management Commands**

#### SSH into your server and run:
```bash
# Check application status
pm2 status

# View logs
pm2 logs

# Restart application
pm2 restart all

# Create admin user
cd /path/to/app/backend && node scripts/createAdmin.js

# Database backup
mysqldump -u username -p database_name > backup.sql
```

### 6. **Security Best Practices**

1. **Role-Based Access Control**
   - All admin routes check `user.role === 'admin'`
   - Frontend hides admin features for non-admins
   - Backend validates admin permissions

2. **Environment Variables**
   ```env
   JWT_SECRET=your-super-secure-jwt-secret
   DB_PASSWORD=your-secure-db-password
   ADMIN_EMAILS=comma,separated,admin,emails
   ```

3. **Rate Limiting**
   ```javascript
   // Add to your Express app
   const rateLimit = require('express-rate-limit');
   app.use('/api/admin', rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   }));
   ```

### 7. **Monitoring & Alerts**

#### Set up monitoring for:
- Application uptime
- Database connections
- Error rates
- Admin login attempts

#### Tools you can use:
- **PM2 Monitoring**: Built-in process monitoring
- **New Relic**: Application performance monitoring
- **Sentry**: Error tracking
- **Uptime Robot**: Website uptime monitoring

### 8. **Backup Strategy**

#### Automated Daily Backups:
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > /backups/db_backup_$DATE.sql
find /backups -name "db_backup_*.sql" -mtime +7 -delete
```

#### Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

### 9. **Quick Deployment Checklist**

- [ ] Set environment variables
- [ ] Create admin user
- [ ] Test admin login
- [ ] Verify role-based access
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test all admin features
- [ ] Set up SSL certificate
- [ ] Configure domain/subdomain

### 10. **Emergency Access**

If you lose admin access:
```bash
# SSH into server
cd /path/to/app/backend
node -e "
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('./src/config/database').sync().then(async () => {
  const user = await User.findOne({ where: { email: 'your-email@example.com' } });
  if (user) {
    await user.update({ role: 'admin' });
    console.log('User promoted to admin');
  }
  process.exit(0);
});
"
```

This approach is much better for production deployment and management!