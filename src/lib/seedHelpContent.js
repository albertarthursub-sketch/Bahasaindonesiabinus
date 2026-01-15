import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import helpContent from '../data/helpContent';

/**
 * Seed the help/FAQ content to Firestore
 * This allows for dynamic updates and searching
 */
export const seedHelpContent = async () => {
  try {
    console.log('🌱 Starting help content seeder...');
    
    const helpCollection = collection(db, 'helpContent');
    
    // Check if content already exists
    const existingDocs = await getDocs(helpCollection);
    console.log(`Found ${existingDocs.docs.length} existing help docs`);
    
    // If content already exists, ask before overwriting
    if (existingDocs.docs.length > 0) {
      console.log('ℹ️ Help content already exists in Firestore');
      console.log('To reseed, run clearHelpContent() first');
      return { success: true, message: 'Help content already seeded' };
    }
    
    let seedCount = 0;
    
    // Seed FAQs
    for (const faq of helpContent.faqs) {
      await setDoc(doc(helpCollection, faq.id), {
        ...faq,
        type: 'faq',
        createdAt: new Date(),
        updatedAt: new Date(),
        searchTerms: [
          faq.question.toLowerCase(),
          faq.category.toLowerCase(),
          ...faq.answer.toLowerCase().split(' ')
        ]
      });
      seedCount++;
    }
    
    console.log(`✅ Successfully seeded ${seedCount} help items to Firestore`);
    return { success: true, itemsSeeded: seedCount };
  } catch (error) {
    console.error('❌ Error seeding help content:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear all help content from Firestore
 * Useful for reseeding with updated content
 */
export const clearHelpContent = async () => {
  try {
    console.log('🗑️ Clearing help content...');
    
    const helpCollection = collection(db, 'helpContent');
    const docs = await getDocs(helpCollection);
    
    let deleteCount = 0;
    for (const document of docs.docs) {
      await deleteDoc(doc(db, 'helpContent', document.id));
      deleteCount++;
    }
    
    console.log(`✅ Deleted ${deleteCount} help items`);
    return { success: true, deleted: deleteCount };
  } catch (error) {
    console.error('❌ Error clearing help content:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Search help content from Firestore
 * Used if you want to fetch from Firestore instead of local data
 */
export const searchHelpContent = async (query) => {
  try {
    const helpCollection = collection(db, 'helpContent');
    const docs = await getDocs(helpCollection);
    
    const results = docs.docs
      .map(doc => doc.data())
      .filter(item => 
        item.question.toLowerCase().includes(query.toLowerCase()) ||
        item.answer.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
    
    return results;
  } catch (error) {
    console.error('❌ Error searching help content:', error);
    return [];
  }
};

/**
 * Get all help content organized by category
 */
export const getHelpByCategory = async (category) => {
  try {
    const helpCollection = collection(db, 'helpContent');
    const docs = await getDocs(helpCollection);
    
    const results = docs.docs
      .map(doc => doc.data())
      .filter(item => item.category === category);
    
    return results;
  } catch (error) {
    console.error('❌ Error fetching help by category:', error);
    return [];
  }
};

export default {
  seedHelpContent,
  clearHelpContent,
  searchHelpContent,
  getHelpByCategory
};
