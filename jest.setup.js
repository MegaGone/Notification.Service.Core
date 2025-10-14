// Configuración global para Jest
jest.setTimeout(30000);

// Mock de variables de entorno
process.env.NODE_ENV = "test";

// Mock global para logger
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
