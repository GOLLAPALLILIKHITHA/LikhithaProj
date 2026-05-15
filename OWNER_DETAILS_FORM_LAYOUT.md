# Owner Details Form Layout

## AdminAddProperty Form Structure

The property listing creation form now includes a comprehensive Owner Details section:

```
┌─────────────────────────────────────────────────────────────┐
│                    Add Property Listing                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Property Type                                                │
│ ┌──────────────────┐  ┌──────────────────┐                 │
│ │  ✓ For Sale      │  │    For Rent      │                 │
│ └──────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Basic Information                                            │
│ ┌──────────────────────┐  ┌──────────────────────┐         │
│ │ Property Title *     │  │ Property Type *      │         │
│ └──────────────────────┘  └──────────────────────┘         │
│ ┌──────────────────────┐  ┌──────────────────────┐         │
│ │ Price *              │  │ Price Type           │         │
│ └──────────────────────┘  └──────────────────────┘         │
│ ┌────────────────────────────────────────────────┐         │
│ │ Description *                                   │         │
│ └────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Location Details                                             │
│ ┌──────────────────────┐  ┌──────────────────────┐         │
│ │ City *               │  │ State                │         │
│ └──────────────────────┘  └──────────────────────┘         │
│ ┌──────────────────────┐  ┌──────────────────────┐         │
│ │ Location/Area *      │  │ Pincode              │         │
│ └──────────────────────┘  └──────────────────────┘         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Property Specifications                                      │
│ ┌─────────┐  ┌─────────┐  ┌─────────┐                      │
│ │Bedrooms │  │Bathrooms│  │  Area   │                      │
│ └─────────┘  └─────────┘  └─────────┘                      │
│ ┌─────────┐  ┌─────────┐  ┌─────────┐                      │
│ │Area Unit│  │Prop Age │  │ Facing  │                      │
│ └─────────┘  └─────────┘  └─────────┘                      │
│ ┌─────────┐  ┌─────────┐  ┌─────────┐                      │
│ │  Floor  │  │Total Flr│  │ Parking │                      │
│ └─────────┘  └─────────┘  └─────────┘                      │
│ ┌─────────┐  ┌─────────────────────┐                       │
│ │Furnish  │  │ Commission (%) *    │                       │
│ └─────────┘  └─────────────────────┘                       │
│                                                              │
│ 💡 Commission Info: This is the percentage commission       │
│    that will be charged on the final sale price.           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 👤 Owner Details                                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Enter the property owner's contact information and          │
│ business details. This information will be used for all     │
│ communications and documentation.                            │
│                                                              │
│ ┌──────────────────────────┐  ┌──────────────────────────┐ │
│ │ Owner Contact Person *   │  │ Owner Contact Phone *    │ │
│ │ Full name of owner       │  │ 10-digit phone number    │ │
│ └──────────────────────────┘  └──────────────────────────┘ │
│                                                              │
│ ┌──────────────────────────┐  ┌──────────────────────────┐ │
│ │ Owner Contact Email *    │  │ Business Name (Optional) │ │
│ │ owner@example.com        │  │ Company or business name │ │
│ └──────────────────────────┘  └──────────────────────────┘ │
│                                                              │
│ 📄 Owner Agreement Document *                               │
│ Upload the signed agreement document with the property      │
│ owner (PDF format only)                                     │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │              📤 Click to upload agreement document      │ │
│ │                    PDF only, max 10MB                   │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ [When file selected:]                                       │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📄 agreement_document.pdf                          [×]  │ │
│ └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Amenities & Features                                         │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│ │ Parking │ │  Lift   │ │Security │ │ Power   │           │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│ ... (more amenities)                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📄 Property Documents (Required)                            │
│ Upload all required property documents. These documents     │
│ are mandatory for property listings.                        │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │         📤 Click to upload property documents          │ │
│ │              PDF, JPG, PNG up to 10MB each             │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ Required Documents:                                          │
│ • Thaluka Papers / Property Documents                       │
│ • Owner ID Proof (Aadhaar Card, PAN Card)                  │
│ • Address Proof                                             │
│ • Property Tax Receipt (if available)                       │
│ • NOC from Society (if applicable)                          │
│ • Any other relevant property documents                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Property Images                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │         📤 Click to upload property images             │ │
│ │         Upload multiple images (JPG, PNG)              │ │
│ └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ☐ Mark as Featured    ☐ Mark as Verified                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              💾 Create Property Listing                      │
└─────────────────────────────────────────────────────────────┘
```

## Key Features of Owner Details Section

### Visual Design
- **Yellow/Amber Gradient Background** - Matches the document upload section style
- **Clear Section Header** - "👤 Owner Details" with emoji for visual identification
- **Helpful Description** - Explains the purpose of the information
- **2-Column Grid Layout** - Efficient use of space for form fields

### Required Fields (marked with *)
1. **Owner Contact Person** - Full name of the property owner or contact person
2. **Owner Contact Phone** - 10-digit phone number for direct contact
3. **Owner Contact Email** - Email address for formal communications
4. **Owner Agreement Document** - PDF upload of signed agreement

### Optional Fields
1. **Business Name** - Company or business name if applicable

### Validation
- All required fields must be filled before submission
- Agreement document must be PDF format only
- File size limit of 10MB for agreement document
- Phone number format validation
- Email format validation

### User Experience
- Clear placeholder text in each field
- File upload shows selected file name with remove button
- Visual feedback when file is selected (✓ Document Selected)
- Error messages if validation fails
- Success message on successful creation

## Data Flow

```
User Input → Form State → Validation → FormData Creation → API Call → Backend Processing → Database Storage
```

### FormData Structure
```javascript
{
  // Property details
  title: "3BHK Apartment",
  price: "5000000",
  location: "Koramangala",
  city: "Bangalore",
  // ... other property fields
  
  // Owner details (NEW)
  contactPerson: "John Doe",
  contactPhone: "9876543210",
  contactEmail: "john@example.com",
  businessName: "Doe Properties",
  commissionPercentage: "2.5",
  
  // Files
  images: [File, File, ...],
  documents: [File, File, ...],
  agreementDocument: File  // NEW
}
```

## Backend Storage

All owner details are stored in the `Listing` table:
- `contactPerson` (STRING)
- `contactPhone` (STRING)
- `contactEmail` (STRING)
- `businessName` (STRING)
- `agreementDocument` (STRING - Cloudinary URL)
- `commissionPercentage` (DECIMAL)

## Owner Management Page Integration

After creation, the Owner Management page displays:
- Property details
- Owner contact information (from listing)
- Commission percentage
- Agreement document (downloadable)
- Edit capabilities for commission and documents
- Sales tracking (if property is sold)
