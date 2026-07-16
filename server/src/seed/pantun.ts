import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Pantun } from '../models/Pantun';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kim-minang';

const generateDummyPantun = () => {
  const pantuns = [];
  for (let i = 1; i <= 90; i++) {
    pantuns.push({
      numberTarget: i,
      text: `Pantun dummy untuk angka ${i}. Jalan-jalan ke Bukittinggi, jangan lupa beli sanjai. Angka ${i} keluar di sini, mari kita sorak ramai-ramai!`,
      language: 'min',
      category: 'humor',
      usageCount: 0
    });
  }
  return pantuns;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for Seeding...');

    await Pantun.deleteMany({});
    console.log('Cleared existing pantun data.');

    const pantuns = generateDummyPantun();
    await Pantun.insertMany(pantuns);
    
    console.log(`Successfully seeded ${pantuns.length} pantuns!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding pantun database:', error);
    process.exit(1);
  }
};

seedDatabase();
