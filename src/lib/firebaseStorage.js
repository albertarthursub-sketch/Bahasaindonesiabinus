import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';

// ==================== STUDENT CODES ====================

/**
 * Generate a unique 6-character student login code
 */
export const generateStudentCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Create a new student record
 */
export const createStudent = async (name, email = '') => {
  try {
    const loginCode = generateStudentCode();
    
    const docRef = await addDoc(collection(db, 'students'), {
      name,
      email,
      loginCode,
      createdAt: new Date().toISOString(),
      status: 'active'
    });

    return {
      id: docRef.id,
      name,
      email,
      loginCode,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

/**
 * Get student by login code
 */
export const getStudentByCode = async (code) => {
  try {
    const q = query(collection(db, 'students'), where('loginCode', '==', code));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error getting student by code:', error);
    throw error;
  }
};

/**
 * Get all students
 */
export const getAllStudents = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'students'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all students:', error);
    throw error;
  }
};

/**
 * Update student information
 */
export const updateStudent = async (studentId, updates) => {
  try {
    const docRef = doc(db, 'students', studentId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

/**
 * Delete student
 */
export const deleteStudent = async (studentId) => {
  try {
    await deleteDoc(doc(db, 'students', studentId));
    return true;
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};

// ==================== VOCABULARY LISTS ====================

/**
 * Create a vocabulary list
 */
export const createVocabularyList = async (title, learningArea, words, tags = []) => {
  try {
    const docRef = await addDoc(collection(db, 'lists'), {
      title,
      learningArea,
      words,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: words.length,
      status: 'active'
    });

    return {
      id: docRef.id,
      title,
      learningArea,
      words,
      tags,
      createdAt: new Date().toISOString(),
      wordCount: words.length
    };
  } catch (error) {
    console.error('Error creating vocabulary list:', error);
    throw error;
  }
};

/**
 * Get vocabulary list by ID
 */
export const getVocabularyList = async (listId) => {
  try {
    const docRef = doc(db, 'lists', listId);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    };
  } catch (error) {
    console.error('Error getting vocabulary list:', error);
    throw error;
  }
};

/**
 * Get all vocabulary lists
 */
export const getAllVocabularyLists = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'lists'), orderBy('createdAt', 'desc'))
    );
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all vocabulary lists:', error);
    throw error;
  }
};

/**
 * Update vocabulary list
 */
export const updateVocabularyList = async (listId, updates) => {
  try {
    const docRef = doc(db, 'lists', listId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating vocabulary list:', error);
    throw error;
  }
};

/**
 * Delete vocabulary list
 */
export const deleteVocabularyList = async (listId) => {
  try {
    await deleteDoc(doc(db, 'lists', listId));
    return true;
  } catch (error) {
    console.error('Error deleting vocabulary list:', error);
    throw error;
  }
};

// ==================== STUDENT PROGRESS ====================

/**
 * Save student progress/attempt
 */
export const saveStudentProgress = async (studentId, listId, word, data) => {
  try {
    const docRef = await addDoc(collection(db, 'progress'), {
      studentId,
      listId,
      word,
      ...data,
      timestamp: new Date().toISOString()
    });

    return {
      id: docRef.id,
      studentId,
      listId,
      word,
      ...data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error saving student progress:', error);
    throw error;
  }
};

/**
 * Get student progress by student ID
 */
export const getStudentProgress = async (studentId, listId = null) => {
  try {
    let q;
    if (listId) {
      q = query(
        collection(db, 'progress'),
        where('studentId', '==', studentId),
        where('listId', '==', listId),
        orderBy('timestamp', 'desc')
      );
    } else {
      q = query(
        collection(db, 'progress'),
        where('studentId', '==', studentId),
        orderBy('timestamp', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting student progress:', error);
    throw error;
  }
};

/**
 * Get all progress for a list
 */
export const getListProgress = async (listId) => {
  try {
    const q = query(
      collection(db, 'progress'),
      where('listId', '==', listId),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting list progress:', error);
    throw error;
  }
};

// ==================== TEACHER RESOURCES ====================

/**
 * Save teacher resource (lesson plans, notes, materials, etc.)
 */
export const saveTeacherResource = async (title, type, content, listId = null, tags = []) => {
  try {
    const docRef = await addDoc(collection(db, 'teacherResources'), {
      title,
      type, // 'lesson_plan', 'notes', 'worksheet', 'assessment', etc.
      content,
      listId,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    });

    return {
      id: docRef.id,
      title,
      type,
      content,
      listId,
      tags,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error saving teacher resource:', error);
    throw error;
  }
};

/**
 * Get teacher resource by ID
 */
export const getTeacherResource = async (resourceId) => {
  try {
    const docRef = doc(db, 'teacherResources', resourceId);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    };
  } catch (error) {
    console.error('Error getting teacher resource:', error);
    throw error;
  }
};

/**
 * Get all teacher resources by type
 */
export const getTeacherResourcesByType = async (type) => {
  try {
    const q = query(
      collection(db, 'teacherResources'),
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting teacher resources by type:', error);
    throw error;
  }
};

/**
 * Get all teacher resources for a specific list
 */
export const getTeacherResourcesForList = async (listId) => {
  try {
    const q = query(
      collection(db, 'teacherResources'),
      where('listId', '==', listId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting teacher resources for list:', error);
    throw error;
  }
};

/**
 * Get all teacher resources
 */
export const getAllTeacherResources = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'teacherResources'), orderBy('createdAt', 'desc'))
    );
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all teacher resources:', error);
    throw error;
  }
};

/**
 * Update teacher resource
 */
export const updateTeacherResource = async (resourceId, updates) => {
  try {
    const docRef = doc(db, 'teacherResources', resourceId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating teacher resource:', error);
    throw error;
  }
};

/**
 * Delete teacher resource
 */
export const deleteTeacherResource = async (resourceId) => {
  try {
    await deleteDoc(doc(db, 'teacherResources', resourceId));
    return true;
  } catch (error) {
    console.error('Error deleting teacher resource:', error);
    throw error;
  }
};

// ==================== STUDENT SESSIONS ====================

/**
 * Create a student learning session
 */
export const createLearningSession = async (studentId, listId) => {
  try {
    const docRef = await addDoc(collection(db, 'sessions'), {
      studentId,
      listId,
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'active',
      wordsCompleted: 0,
      wordsCorrect: 0,
      totalStars: 0
    });

    return {
      id: docRef.id,
      studentId,
      listId,
      startTime: new Date().toISOString(),
      status: 'active'
    };
  } catch (error) {
    console.error('Error creating learning session:', error);
    throw error;
  }
};

/**
 * End a learning session
 */
export const endLearningSession = async (sessionId, finalStats) => {
  try {
    const docRef = doc(db, 'sessions', sessionId);
    await updateDoc(docRef, {
      endTime: new Date().toISOString(),
      status: 'completed',
      ...finalStats
    });
    return true;
  } catch (error) {
    console.error('Error ending learning session:', error);
    throw error;
  }
};

/**
 * Get student sessions
 */
export const getStudentSessions = async (studentId, listId = null) => {
  try {
    let q;
    if (listId) {
      q = query(
        collection(db, 'sessions'),
        where('studentId', '==', studentId),
        where('listId', '==', listId),
        orderBy('startTime', 'desc')
      );
    } else {
      q = query(
        collection(db, 'sessions'),
        where('studentId', '==', studentId),
        orderBy('startTime', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting student sessions:', error);
    throw error;
  }
};

// ==================== BATCH OPERATIONS ====================

/**
 * Import multiple students at once
 */
export const importStudents = async (studentList) => {
  try {
    const results = [];
    for (const student of studentList) {
      const result = await createStudent(student.name, student.email || '');
      results.push(result);
    }
    return results;
  } catch (error) {
    console.error('Error importing students:', error);
    throw error;
  }
};

/**
 * Export student data (for backup or analysis)
 */
export const exportStudentData = async (studentId) => {
  try {
    const student = await getDoc(doc(db, 'students', studentId));
    const progress = await getStudentProgress(studentId);
    const sessions = await getStudentSessions(studentId);

    return {
      student: student.data(),
      progress,
      sessions
    };
  } catch (error) {
    console.error('Error exporting student data:', error);
    throw error;
  }
};

/**
 * Get comprehensive statistics for a list
 */
export const getListStatistics = async (listId) => {
  try {
    const progress = await getListProgress(listId);
    const list = await getVocabularyList(listId);

    const stats = {
      listId,
      title: list.title,
      totalWords: list.words.length,
      totalAttempts: progress.length,
      uniqueStudents: new Set(progress.map(p => p.studentId)).size,
      correctAttempts: progress.filter(p => p.correct).length,
      averageAccuracy: 0,
      totalStarsEarned: 0,
      wordStats: {}
    };

    // Calculate word-level statistics
    list.words.forEach(word => {
      const wordProgress = progress.filter(p => p.word === word.bahasa);
      const correct = wordProgress.filter(p => p.correct).length;
      
      stats.wordStats[word.bahasa] = {
        english: word.english,
        attempts: wordProgress.length,
        correct,
        accuracy: wordProgress.length > 0 ? Math.round((correct / wordProgress.length) * 100) : 0,
        starsEarned: wordProgress.reduce((sum, p) => sum + (p.starsEarned || 0), 0)
      };
    });

    stats.averageAccuracy = progress.length > 0
      ? Math.round((stats.correctAttempts / stats.totalAttempts) * 100)
      : 0;
    
    stats.totalStarsEarned = progress.reduce((sum, p) => sum + (p.starsEarned || 0), 0);

    return stats;
  } catch (error) {
    console.error('Error getting list statistics:', error);
    throw error;
  }
};

export default {
  // Student Codes & Management
  generateStudentCode,
  createStudent,
  getStudentByCode,
  getAllStudents,
  updateStudent,
  deleteStudent,

  // Vocabulary Lists
  createVocabularyList,
  getVocabularyList,
  getAllVocabularyLists,
  updateVocabularyList,
  deleteVocabularyList,

  // Student Progress
  saveStudentProgress,
  getStudentProgress,
  getListProgress,

  // Teacher Resources
  saveTeacherResource,
  getTeacherResource,
  getTeacherResourcesByType,
  getTeacherResourcesForList,
  getAllTeacherResources,
  updateTeacherResource,
  deleteTeacherResource,

  // Sessions
  createLearningSession,
  endLearningSession,
  getStudentSessions,

  // Batch Operations
  importStudents,
  exportStudentData,
  getListStatistics
};
