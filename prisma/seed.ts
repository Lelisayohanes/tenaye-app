import 'dotenv/config';
import dns from 'dns';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Force Node.js to prioritize IPv4 DNS records to prevent IPv6 timeouts on local network
dns.setDefaultResultOrder('ipv4first');

console.log("SEEDING LOG - Current working directory:", process.cwd());
console.log("SEEDING LOG - DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("SEEDING LOG - DIRECT_DATABASE_URL exists:", !!process.env.DIRECT_DATABASE_URL);

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL || 'postgresql://neondb_owner:npg_BsTG2hzLc0Qp@ep-silent-hall-aqnxrly1-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
console.log("SEEDING LOG - Connecting using connectionString:", connectionString.replace(/:[^:@]+@/, ":[MASKED_PASSWORD]@"));

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const dishes = [
  {
    nameEn: 'Ayib be Gomen',
    nameAm: 'አይብ በጎመን',
    category: 'Starters',
    description: 'Low-carb crumbled fresh cottage cheese served with spiced collard greens. Rich in protein and calcium.',
    containsAllergens: 'Dairy',
    glycemicIndex: 15,
    carbsG: 2.0,
    sodiumMg: 150.0,
    safeDiabetic: true,
    safeHypertension: true,
    isRaw: false,
    isDairyProduct: true,
    tags: 'Low GI,High Fiber,High Protein'
  },
  {
    nameEn: 'Tibs (grilled)',
    nameAm: 'ጥብስ',
    category: 'Mains',
    description: 'Sautéed lean beef or lamb cubes grilled with onions, garlic, and hot green pepper. Extremely low-carb main.',
    containsAllergens: '',
    glycemicIndex: 5,
    carbsG: 1.0,
    sodiumMg: 450.0,
    safeDiabetic: true,
    safeHypertension: true,
    isRaw: false,
    isDairyProduct: false,
    tags: 'High Protein,Low GI'
  },
  {
    nameEn: 'Gomen',
    nameAm: 'ጎመን',
    category: 'Sides',
    description: 'Tender collard greens simmered slowly with chopped garlic, fresh white onions, and minor ginger extracts. Very low sodium.',
    containsAllergens: '',
    glycemicIndex: 10,
    carbsG: 3.0,
    sodiumMg: 80.0,
    safeDiabetic: true,
    safeHypertension: true,
    isRaw: false,
    isDairyProduct: false,
    tags: 'Low Sodium,High Fiber'
  },
  {
    nameEn: 'Shiro',
    nameAm: 'ሽሮ',
    category: 'Mains',
    description: 'Rich, spiced chickpea powders slowly simmered with grated onions, spicy minced berbere, and fresh garlic sauce. Comfort vegan meal.',
    containsAllergens: '',
    glycemicIndex: 60,
    carbsG: 18.0,
    sodiumMg: 550.0,
    safeDiabetic: true,
    safeHypertension: true,
    isRaw: false,
    isDairyProduct: false,
    tags: 'Moderate Carbs,Vegan'
  },
  {
    nameEn: 'Injera',
    nameAm: 'እንጀራ',
    category: 'Sides',
    description: 'Traditional fermented sourdough crepe made from teff cereal grains. Essential base of Ethiopian dinings but high glycemic index.',
    containsAllergens: '',
    glycemicIndex: 80,
    carbsG: 45.0,
    sodiumMg: 120.0,
    safeDiabetic: false,
    safeHypertension: true,
    isRaw: false,
    isDairyProduct: false,
    tags: 'High GI'
  },
  {
    nameEn: 'Firfir',
    nameAm: 'ፍርፍር',
    category: 'Mains',
    description: 'Shredded injera pieces soaked and cooked in spicy tomato and berbere sauce with added spiced butter (Kibe). Extremely high carbohydrate load.',
    containsAllergens: 'Dairy',
    glycemicIndex: 85,
    carbsG: 65.0,
    sodiumMg: 950.0,
    safeDiabetic: false,
    safeHypertension: false,
    isRaw: false,
    isDairyProduct: true,
    tags: 'Very High Glycemic Load'
  },
  {
    nameEn: 'Kitfo',
    nameAm: 'ክትፎ',
    category: 'Mains',
    description: 'Finely chopped lean beef fillets, seasoned with melted niter kibe spiced butter and mitmita red pepper. Classically served raw.',
    containsAllergens: 'Dairy',
    glycemicIndex: 5,
    carbsG: 1.5,
    sodiumMg: 850.0,
    safeDiabetic: true,
    safeHypertension: false,
    isRaw: true,
    isDairyProduct: true,
    tags: 'Raw Meat Risk,High Sodium'
  },
  {
    nameEn: 'Sambusa',
    nameAm: 'ሳምቡሳ',
    category: 'Starters',
    description: 'Crisp, fried thin triangular pastries stuffed with spiced garlic green lentils, or sweet beef chops with minced greens.',
    containsAllergens: 'Gluten',
    glycemicIndex: 65,
    carbsG: 28.0,
    sodiumMg: 420.0,
    safeDiabetic: false,
    safeHypertension: true,
    isRaw: false,
    isDairyProduct: false,
    tags: 'Wheat Content,Crispy'
  },
  {
    nameEn: 'Doro Wat',
    nameAm: 'ዶሮ ወጥ',
    category: 'Mains',
    description: 'The premier legendary rich chicken stew, slowly cooked with deep berbere red onions, organic butter, and served with whole boiled eggs.',
    containsAllergens: 'Dairy,Eggs',
    glycemicIndex: 20,
    carbsG: 6.0,
    sodiumMg: 1100.0,
    safeDiabetic: true,
    safeHypertension: false,
    isRaw: false,
    isDairyProduct: true,
    tags: 'Contains Eggs,High Sodium'
  },
  {
    nameEn: 'Kik Alicha',
    nameAm: 'ኪክ ዓሊጫ',
    category: 'Sides',
    description: 'Split yellow peas simmered gracefully in mild garlic and turmeric broth. Packed with fiber and easy to digest.',
    containsAllergens: '',
    glycemicIndex: 35,
    carbsG: 15.0,
    sodiumMg: 220.0,
    safeDiabetic: true,
    safeHypertension: true,
    isRaw: false,
    isDairyProduct: false,
    tags: 'High Fiber,Vegan,Mild'
  },
  {
    nameEn: 'Buticha',
    nameAm: 'ቡቲቻ',
    category: 'Starters',
    description: 'Ethiopian-style "hummus" spread: cooked chickpea puree blended with red onions, fresh green peppers, olive oil, and lemon.',
    containsAllergens: '',
    glycemicIndex: 30,
    carbsG: 8.0,
    sodiumMg: 180.0,
    safeDiabetic: true,
    safeHypertension: true,
    isRaw: false,
    isDairyProduct: false,
    tags: 'Vegan,Low GI'
  },
  {
    nameEn: 'Tej (Honey Wine)',
    nameAm: 'ጠጅ',
    category: 'Sides',
    description: 'Traditional Ethiopian honey wine sweetened with natural ingredients and fermented with leaves. Very high biological sugar concentration.',
    containsAllergens: '',
    glycemicIndex: 90,
    carbsG: 35.0,
    sodiumMg: 10.0,
    safeDiabetic: false,
    safeHypertension: true,
    isRaw: false,
    isDairyProduct: false,
    tags: 'High Sugar Content'
  }
];

async function main() {
  console.log('Seeding dishes...');
  await prisma.dish.deleteMany({});
  for (const dish of dishes) {
    await prisma.dish.create({
      data: dish,
    });
  }
  console.log('Successfully seeded dishes.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
