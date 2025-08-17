// jest.setup.ts
import '@testing-library/jest-dom';

// Polyfill for Request/Response in Node.js test environment
import { TextDecoder, TextEncoder } from 'util';

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Mock Next.js Request/Response
Object.defineProperty(global, 'Request', {
  value: class Request {
    constructor(public url: string, public init?: RequestInit) {}
  },
  writable: true,
});

Object.defineProperty(global, 'Response', {
  value: class Response {
    constructor(public body?: any, public init?: ResponseInit) {}
    static json(object: any, init?: ResponseInit) {
      return new Response(JSON.stringify(object), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      });
    }
  },
  writable: true,
});

// Mock fetch for tests
global.fetch = jest.fn();
