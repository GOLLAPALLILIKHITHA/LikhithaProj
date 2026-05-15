# Document Viewing Guide

## How Documents Are Stored and Viewed

### Document Storage Flow

```
Admin Creates Listing
        ↓
Uploads Documents
        ↓
Files → Cloudinary (Cloud Storage)
        ↓
URLs Stored in Database
        ↓
Accessible Anytime from Owner Management
```

## Documents Stored During Listing Creation

### 1. Agreement Document
- **Field Name**: `agreementDocument`
- **Type**: Single PDF file
- **Storage**: Cloudinary URL (string)
- **Required**: Yes
- **Max Size**: 10MB
- **Format**: PDF only

### 2. Property Documents
- **Field Name**: `ownerDocuments`
- **Type**: Multiple files (PDF, JPG, PNG)
- **Storage**: Cloudinary URLs (JSON array)
- **Required**: Yes (at least one document)
- **Max Size**: 10MB per file
- **Format**: PDF, JPG, PNG
- **Examples**: Thaluka papers, ID proofs, address proof, tax receipts, NOC

### 3. Property Images
- **Field Name**: `images`
- **Type**: Multiple image files
- **Storage**: Cloudinary URLs (JSON array)
- **Required**: No (but recommended)
- **Max Size**: 5MB per file
- **Format**: JPG, PNG, WEBP

## Owner Management Page - Document Display

### Modal Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    🏠 Property Details                       │
│                    ━━━━━━━━━━━━━━━━━━                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐
│  🏠 Property Information │  │  👤 Owner Information    │
│  ━━━━━━━━━━━━━━━━━━━━━━│  │  ━━━━━━━━━━━━━━━━━━━━━━│
│                          │  │                          │
│  Title: 3BHK Apartment   │  │  Name: John Doe         │
│  Location: Koramangala   │  │  Email: john@email.com  │
│  Price: ₹50,00,000       │  │  Phone: 9876543210      │
│  Status: FOR SALE        │  │  Business: Doe Props    │
│  Commission: 2.5%        │  │  Contact: 9876543210    │
└──────────────────────────┘  └──────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              📄 Property Documents                           │
│              ━━━━━━━━━━━━━━━━━━━━━━                         │
│  Documents uploaded during property listing creation        │
│  (Thaluka papers, ID proofs, etc.)                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ 📄 Document 1│  │ 📄 Document 2│  │ 🖼️ Document 3│     │
│  │ Thaluka.pdf  │  │ Aadhaar.pdf  │  │ Photo.jpg    │     │
│  │ Click to view│  │ Click to view│  │ Click to view│     │
│  │           → │  │           → │  │           → │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  [Each card is clickable and opens document in new tab]     │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐
│  📄 Upload Agreement Doc │  │  💰 Manage Commission    │
│  ━━━━━━━━━━━━━━━━━━━━━━│  │  ━━━━━━━━━━━━━━━━━━━━━━│
│                          │  │                          │
│  Upload PDF document     │  │  Current Commission:     │
│  containing terms and    │  │  ┌──────────────────┐   │
│  conditions              │  │  │      2.5%        │   │
│                          │  │  └──────────────────┘   │
│  [Choose File]           │  │                          │
│  [📤 Upload Document]    │  │  [✏️ Edit Commission]   │
│                          │  │                          │
│  Current Document:       │  │                          │
│  📎 View Agreement Doc   │  │                          │
│     ↑ Clickable Link     │  │                          │
└──────────────────────────┘  └──────────────────────────┘
```

## Document Display Features

### Agreement Document Section
```
Location: Bottom left card in modal
Display: 
  - Shows "Current Document:" label
  - Clickable link with icon: "📎 View Agreement Document"
  - Blue color (#0284c7) for link
  - Opens in new browser tab
  - Can be replaced by uploading new document
```

### Property Documents Section
```
Location: Below owner information cards
Display:
  - Grid layout (auto-fill, min 250px per card)
  - Each document shows:
    ┌────────────────────────┐
    │ 📄  Document Name      │
    │     Click to view   → │
    └────────────────────────┘
  
Features:
  - PDF icon (📄) for PDF files
  - Image icon (🖼️) for image files
  - Document name or "Document 1, 2, 3..."
  - Hover effect (lifts up, adds shadow)
  - Opens in new tab when clicked
  - Responsive grid layout
```

### Owner Contact Information
```
Location: Right card in top section
Display:
  - Owner name with verification badge
  - Email with 📧 icon
  - Phone with 📞 icon
  - Business name with 🏢 icon (if provided)
  - Contact phone with 📱 icon (if different)
  - WhatsApp with 💬 icon (if provided)
```

## How to View Documents

### For Agreement Document:
1. Go to Owner Management page
2. Click "View Details" button on any property
3. Scroll to "Upload Agreement Document" section
4. Click on "📎 View Agreement Document" link
5. Document opens in new browser tab
6. Can view, download, or print from browser

### For Property Documents:
1. Go to Owner Management page
2. Click "View Details" button on any property
3. Look for "📄 Property Documents" section
4. Click on any document card
5. Document opens in new browser tab
6. Can view, download, or print from browser

## Document Card Interaction

### Normal State:
```
┌────────────────────────────────┐
│ 📄  Thaluka_Papers.pdf         │
│     Click to view           → │
└────────────────────────────────┘
Background: rgba(255,255,255,0.8)
Border: 2px solid #fbbf24
```

### Hover State:
```
┌────────────────────────────────┐
│ 📄  Thaluka_Papers.pdf         │  ↑ Lifts up 2px
│     Click to view           → │
└────────────────────────────────┘
Background: rgba(255,255,255,1)
Shadow: 0 4px 12px rgba(251,191,36,0.3)
```

### Click Action:
```
Opens document URL in new browser tab
Example: https://res.cloudinary.com/infraall/raw/upload/v1234567890/INFRAALL/document.pdf
```

## Database Structure

### Listing Table Fields:

```javascript
{
  // Owner Contact Details
  contactPerson: "John Doe",
  contactPhone: "9876543210",
  contactEmail: "john@example.com",
  businessName: "Doe Properties",
  
  // Documents
  agreementDocument: "https://cloudinary.com/.../agreement.pdf",
  
  ownerDocuments: [
    {
      url: "https://cloudinary.com/.../thaluka.pdf",
      originalName: "Thaluka_Papers.pdf",
      uploadedAt: "2024-01-15T10:30:00Z"
    },
    {
      url: "https://cloudinary.com/.../aadhaar.pdf",
      originalName: "Aadhaar_Card.pdf",
      uploadedAt: "2024-01-15T10:30:00Z"
    }
  ],
  
  images: [
    "https://cloudinary.com/.../image1.jpg",
    "https://cloudinary.com/.../image2.jpg"
  ],
  
  // Other fields...
  commissionPercentage: 2.5
}
```

## API Endpoints

### Get Owner Details (with documents):
```
GET /api/admin/owners
GET /api/admin/owners/:id

Response includes:
- agreementDocument (URL string)
- ownerDocuments (array of objects)
- contactPerson, contactPhone, contactEmail
- businessName
- commissionPercentage
```

### Upload New Agreement Document:
```
POST /api/admin/owners/:id/upload-document
Content-Type: multipart/form-data

Body:
- document: File (PDF)

Response:
- Updated listing with new agreementDocument URL
```

### Update Owner Details:
```
PUT /api/admin/owners/:id
Content-Type: multipart/form-data

Body:
- ownerDocuments: File[] (optional)
- thalukaDocuments: File[] (optional)
- agreementDocument: File (optional)
- commissionPercentage: number (optional)
- Other owner fields...

Response:
- Updated listing with new document URLs
```

## Security & Access

### Document URLs:
- Stored in Cloudinary (secure cloud storage)
- Publicly accessible via URL (for authorized users)
- URLs are permanent and don't expire
- Can be shared with buyers/tenants when needed

### Access Control:
- Only admin can view Owner Management page
- Admin authentication required (JWT token)
- Documents are only visible to logged-in admin users
- Buyers/tenants don't have access to owner documents

## Benefits

✅ **Permanent Storage** - Documents never get lost
✅ **Easy Access** - View anytime from Owner Management
✅ **No Re-upload** - Documents stored once, accessible forever
✅ **Multiple Formats** - Supports PDF, JPG, PNG
✅ **Organized Display** - Clear categorization and layout
✅ **Quick Preview** - Opens in new tab for easy viewing
✅ **Download Option** - Can download from browser
✅ **Scalable** - Cloudinary handles all file storage
✅ **Fast Loading** - Optimized delivery from CDN

## Troubleshooting

### Document Not Showing?
- Check if document was uploaded during listing creation
- Verify `ownerDocuments` or `agreementDocument` field in database
- Check Cloudinary dashboard for uploaded files
- Ensure URL is valid and accessible

### Can't Open Document?
- Check browser popup blocker settings
- Verify Cloudinary URL is accessible
- Check internet connection
- Try right-click → "Open in new tab"

### Document Upload Failed?
- Check file size (max 10MB)
- Verify file format (PDF, JPG, PNG only)
- Check Cloudinary credentials in .env
- Check server logs for errors
