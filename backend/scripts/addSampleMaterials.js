require('dotenv').config();
const Listing = require('../src/models/Listing');
const sequelize = require('../src/config/database');

async function addSampleMaterials() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const materials = [
      {
        userId: 1, // Admin user
        title: 'Premium Quality Cement - 50kg Bags',
        description: 'High-grade Portland Pozzolana Cement (PPC) suitable for all types of construction work. Provides excellent strength and durability. Ideal for residential and commercial projects. Conforms to IS 1489 standards.',
        price: 350,
        priceType: 'per_unit',
        category: 'materials',
        subCategory: 'Cement',
        
        // Location
        location: 'Gachibowli',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500032',
        
        // Material details
        brand: 'UltraTech',
        condition: 'new',
        warranty: '6 months from manufacturing date',
        quantity: 500,
        unit: 'bags',
        grade: 'Premium',
        specifications: 'Compressive Strength: 33 MPa at 28 days, Setting Time: Initial 30 min, Final 600 min, Fineness: 300 m²/kg',
        
        // Images
        images: [
          'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop'
        ],
        
        isFeatured: true,
        isVerified: true,
        status: 'active'
      },
      {
        userId: 1, // Admin user
        title: 'TMT Steel Bars - Fe500 Grade',
        description: 'High-strength TMT (Thermo-Mechanically Treated) steel bars with superior ductility and weldability. Earthquake resistant and corrosion resistant. Perfect for RCC construction, columns, beams, and slabs. ISI certified.',
        price: 65,
        priceType: 'per_kg',
        category: 'materials',
        subCategory: 'Steel',
        
        // Location
        location: 'Kukatpally',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500072',
        
        // Material details
        brand: 'TATA Tiscon',
        condition: 'new',
        warranty: '1 year',
        quantity: 10000,
        unit: 'kg',
        grade: 'Grade A',
        size: '8mm, 10mm, 12mm, 16mm, 20mm, 25mm available',
        specifications: 'Yield Strength: 500 N/mm², Tensile Strength: 545 N/mm², Elongation: 14.5%, Conforms to IS 1786:2008',
        
        // Images
        images: [
          'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop'
        ],
        
        isFeatured: true,
        isVerified: true,
        status: 'active'
      }
    ];

    console.log('');
    console.log('🔄 Adding sample material listings...');
    console.log('');

    for (const material of materials) {
      const created = await Listing.create(material);
      console.log(`✅ Created: ${created.title}`);
      console.log(`   📍 Location: ${created.location}, ${created.city}`);
      console.log(`   💰 Price: ₹${created.price}/${created.priceType.replace('per_', '')}`);
      console.log(`   📦 Quantity: ${created.quantity} ${created.unit}`);
      console.log('');
    }

    const totalCount = await Listing.count();
    console.log(`✅ Successfully added ${materials.length} material listings!`);
    console.log(`📊 Total listings in database: ${totalCount}`);
    console.log('');
    console.log('You can view these materials at:');
    console.log('👉 http://localhost:5173/materials');
    console.log('');
    console.log('Select "Hyderabad" as city and "Cement" or "Steel" as material type');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding materials:', error);
    process.exit(1);
  }
}

addSampleMaterials();
