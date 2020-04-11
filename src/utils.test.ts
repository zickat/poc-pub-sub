import { createParams, formatPath, splitPath } from './utils';

describe('utils', () => {
  describe('split path', () => {
    // Arrange
    const useCases = [
      {
        path: '',
        expected: [''],
      },
      {
        path: 'a',
        expected: ['a'],
      },
      {
        path: 'a.b',
        expected: ['a', 'b'],
      },
      {
        path: 'a/b/c',
        expected: ['a', 'b', 'c'],
      },
      {
        path: '/a/b/c',
        expected: ['a', 'b', 'c'],
      },
    ];

    useCases.forEach((useCase, index) => {
      it(`should match use case ${index}`, () => {
        // Act
        const res = splitPath(useCase.path);

        // Assert
        expect(res).toEqual(useCase.expected);
      });
    });
  });

  describe('format path', () => {
    // Arrange
    const useCases = [
      {
        path: '',
        expected: '',
      },
      {
        path: 'a',
        expected: 'a',
      },
      {
        path: '/a',
        expected: 'a',
      },
      {
        path: '/a/:id',
        expected: 'a.*',
      },
    ];

    useCases.forEach((useCase, index) => {
      it(`should match use case ${index}`, () => {
        // Act
        const res = formatPath(useCase.path);

        // Assert
        expect(res).toEqual(useCase.expected);
      });
    });
  });

  describe('create params', () => {
    // Arrange
    const useCases = [
      {
        path: '',
        subject: '',
        expected: {},
      },
      {
        path: 'a',
        subject: 'a',
        expected: {},
      },
      {
        path: '/a/:id',
        subject: 'a.1',
        expected: { id: '1' },
      },
      {
        path: '/a/:id/:id2',
        subject: 'a.1.2',
        expected: { id: '1', id2: '2' },
      },
    ];

    useCases.forEach((useCase, index) => {
      it(`should match use case ${index}`, () => {
        // Act
        const res = createParams(useCase.path, useCase.subject);

        // Assert
        expect(res).toEqual(useCase.expected);
      });
    });
  });
});
