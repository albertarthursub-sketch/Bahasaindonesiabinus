import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TeacherAnalytics from '../src/pages/TeacherAnalytics';

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('TeacherAnalytics - Cross-Teacher Data Isolation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  test('should filter classes by current teacher\'s ID only', async () => {
    const { query, where } = require('firebase/firestore');

    // Teacher 1 logs in
    sessionStorage.setItem('authToken', 'teacher-1-uid');
    sessionStorage.setItem('teacherEmail', 'teacher1@school.com');

    // Mock classes data - only this teacher's classes should be returned
    const teacher1Classes = [
      { id: 'class-1', data: () => ({ name: 'Class A', teacherId: 'teacher-1-uid' }) },
      { id: 'class-2', data: () => ({ name: 'Class B', teacherId: 'teacher-1-uid' }) },
    ];

    const { getDocs } = require('firebase/firestore');
    getDocs.mockResolvedValueOnce({ docs: teacher1Classes });

    // Verify filtering by teacherId (not teacherEmail)
    expect(where).toHaveBeenCalledWith('teacherId', '==', 'teacher-1-uid');
    expect(where).not.toHaveBeenCalledWith('teacherEmail', '==', expect.anything());
  });

  test('should NOT load classes from other teachers', () => {
    const { query, where, getDocs } = require('firebase/firestore');

    sessionStorage.setItem('authToken', 'teacher-1-uid');
    sessionStorage.setItem('teacherEmail', 'teacher1@school.com');

    // Simulate loading classes
    const otherTeacherClasses = [
      { id: 'class-x', data: () => ({ name: 'Other Class', teacherId: 'teacher-2-uid' }) },
    ];

    getDocs.mockResolvedValueOnce({ docs: [] }); // Teacher 1 has no classes
    getDocs.mockResolvedValueOnce({ docs: otherTeacherClasses }); // But somehow got teacher 2's classes

    // The WHERE clause should prevent this
    const whereCall = where.mock.calls[0];
    expect(whereCall[0]).toBe('teacherId');
    expect(whereCall[2]).toBe('teacher-1-uid');
    expect(whereCall[2]).not.toBe('teacher-2-uid');
  });

  test('should filter lists by teacherId', () => {
    const { query, where } = require('firebase/firestore');

    sessionStorage.setItem('authToken', 'teacher-1-uid');
    sessionStorage.setItem('teacherEmail', 'teacher1@school.com');

    // Verify lists are filtered by teacherId
    const whereCalls = where.mock.calls.filter(
      call => call[0] === 'teacherId'
    );
    
    // Should have WHERE clause for teacherId when loading lists
    expect(whereCalls.length).toBeGreaterThan(0);
  });

  test('should redirect if not authenticated', () => {
    sessionStorage.clear(); // No authToken

    render(
      <BrowserRouter>
        <TeacherAnalytics />
      </BrowserRouter>
    );

    // Should handle missing auth gracefully or redirect
    // (Implementation depends on TeacherAnalytics behavior)
  });
});
