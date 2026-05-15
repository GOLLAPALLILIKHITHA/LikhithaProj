# Vendor Credential Setup Scripts

This directory contains scripts to create vendor login credentials for the INFRAALL platform.

## Available Scripts

### 1. `quickVendorSetup.js` - Quick Setup with Templates
**Best for: Getting started quickly with common vendor types**

```bash
# See available templates
node quickVendorSetup.js

# Create a specific vendor type
node quickVendorSetup.js materials
node quickVendorSetup.js plumber
node quickVendorSetup.js electrician
node quickVendorSetup.js carpenter
node quickVendorSetup.js painter

# Create all vendor types at once
node quickVendorSetup.js all
```

**Available Templates:**
- `materials` - Building materials supplier
- `plumber` - Plumbing services
- `electrician` - Electrical services  
- `carpenter` - Carpentry services
- `painter` - Painting services

### 2. `interactiveVendorCreator.js` - Interactive Setup
**Best for: Custom vendor creation with your own details**

```bash
node interactiveVendorCreator.js
```

This script will prompt you for:
- Email and password
- Business name and contact details
- Location (city, locality, state, pincode)
- Vendor type (building materials or home services)
- Service categories
- Business description

### 3. `createVendorCredentials.js` - Programmatic Setup
**Best for: Developers who want to modify the script**

```bash
# Create single vendor (edit script first)
node createVendorCredentials.js

# Create multiple predefined vendors
node createVendorCredentials.js --multiple
```

Edit the `vendorData` object in the script to customize vendor details.

## Vendor Types

### Building Materials (`building_materials`)
For vendors selling construction materials like:
- Cement, Steel, Bricks
- Sand, Aggregates
- Tiles, Paint
- Hardware items

### Home Services (`home_services`)  
For service providers offering:
- Plumbing, Electrical work
- Carpentry, Painting
- Cleaning, Maintenance
- Repair services

## Default Credentials

### Quick Setup Templates:
| Template | Email | Password | Business Name |
|----------|-------|----------|---------------|
| materials | materials@vendor.com | Materials@123 | Premium Building Materials |
| plumber | plumber@vendor.com | Plumber@123 | Expert Plumbing Services |
| electrician | electrician@vendor.com | Electric@123 | PowerFix Electrical Services |
| carpenter | carpenter@vendor.com | Carpenter@123 | WoodCraft Carpentry |
| painter | painter@vendor.com | Painter@123 | ColorPro Painting Services |

## Usage Instructions

1. **Run the script:**
   ```bash
   cd backend/scripts
   node quickVendorSetup.js materials
   ```

2. **Login to vendor portal:**
   - Go to: `http://localhost:5173/vendor/login`
   - Use the email and password from script output
   - You should be logged in as a vendor

3. **Admin verification:**
   - New vendors are created as unverified
   - Admin needs to verify vendor profiles
   - Go to admin panel → Vendors → Toggle verification

## Troubleshooting

### Database Connection Issues
```bash
# Make sure database is running
# Check .env file has correct database credentials
```

### User Already Exists
```bash
# Script will link existing user to new vendor profile
# If vendor profile exists, script will show existing details
```

### Permission Issues
```bash
# Make sure you're in the backend directory
cd backend
node scripts/quickVendorSetup.js materials
```

## Environment Variables Required

Make sure your `.env` file has:
```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

## Next Steps After Creating Vendors

1. **Test Login:**
   - Go to vendor portal
   - Login with created credentials
   - Verify vendor dashboard loads

2. **Admin Actions:**
   - Login as admin
   - Go to vendor management
   - Verify vendor profiles
   - Assign service requests to vendors

3. **Test Vendor Features:**
   - View assigned service requests
   - Update assignment status
   - Test vendor profile management

## Support

If you encounter issues:
1. Check database connection
2. Verify environment variables
3. Check script output for error messages
4. Ensure all required dependencies are installed

For custom vendor creation, modify the scripts or create new ones based on the existing templates.