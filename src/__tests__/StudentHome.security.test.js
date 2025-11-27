import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentHome from '../src/pages/StudentHome';
import * as firebaseModule from '../src/firebase';

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('StudentHome - Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  test('should redirect to login if student not authenticated', () => {
    // Student not in sessionStorage
    render(
      <BrowserRouter>
        <StudentHome />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/student');
  });

  test('should only load lists assigned to the student\'s class', async () => {
    const { getDocs, query, where } = require('firebase/firestore');
    
    // Mock student data
    const studentData = {
      id: 'student-123',
      classId: 'class-456',
      name: 'Test Student',
    };
    sessionStorage.setItem('student', JSON.stringify(studentData));

    // Mock assignments query (only lists assigned to this class)
    const mockAssignmentDocs = [
      { data: () => ({ listId: 'list-1' }) },
      { data: () => ({ listId: 'list-2' }) },
    ];

    // Mock list documents
    const mockListDocs = [
      { id: 'list-1', data: () => ({ title: 'List 1', teacherId: 'teacher-1' }) },
      { id: 'list-2', data: () => ({ title: 'List 2', teacherId: 'teacher-1' }) },
    ];

    getDocs
      .mockResolvedValueOnce({ docs: mockAssignmentDocs }) // First call for assignments
      .mockResolvedValueOnce({ docs: [] }); // SPO activities

    // Verify that:
    // 1. Query filters by classId
    // 2. Query filters by isActive = true
    // 3. Only lists in assignments are loaded (not ALL lists)

    expect(where).toHaveBeenCalledWith('classId', '==', 'class-456');
    expect(where).toHaveBeenCalledWith('isActive', '==', true);
  });

  test('should not load lists from other classes', async () => {
    const { getDocs, query, where } = require('firebase/firestore');
    
    const studentData = {
      id: 'student-123',
      classId: 'class-456',
      name: 'Test Student',
    };
    sessionStorage.setItem('student', JSON.stringify(studentData));

    // This should NOT happen - lists from other classes should not be included
    const mockAssignmentDocs = [
      { data: () => ({ listId: 'list-1', classId: 'class-456' }) },
    ];

    getDocs.mockResolvedValueOnce({ docs: mockAssignmentDocs });

    // Verify the WHERE clause includes classId filtering
    expect(where).toHaveBeenCalledWith('classId', '==', 'class-456');
    
    // Verify it's NOT querying all lists in the database
    const queryCall = query.mock.calls[0];
    const hasProperFiltering = queryCall && queryCall.length > 1;
    expect(hasProperFiltering).toBe(true);
  });
});
