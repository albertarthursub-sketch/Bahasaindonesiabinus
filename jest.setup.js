import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('./src/firebase', () => ({
  db: {},
  storage: {},
  auth: {},
}));
