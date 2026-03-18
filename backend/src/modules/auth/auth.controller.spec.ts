jest.mock('../../config/auth', () => ({
  auth: {},
}));

const mockHandler = jest.fn();
jest.mock('better-auth/node', () => ({
  toNodeHandler: jest.fn(() => mockHandler),
  fromNodeHeaders: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { toNodeHandler } from 'better-auth/node';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();
    (toNodeHandler as jest.Mock).mockReturnValue(mockHandler);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should initialize handler via toNodeHandler', () => {
    expect(toNodeHandler).toHaveBeenCalled();
  });

  it('should set req.url to originalUrl before delegating', async () => {
    const mockReq = { url: '', originalUrl: '/auth/sign-in/email' } as any;
    const mockRes = {} as any;

    await controller.handleAuth(mockReq, mockRes);

    expect(mockReq.url).toBe('/auth/sign-in/email');
  });

  it('should call the better-auth handler with req and res', async () => {
    const mockReq = { url: '', originalUrl: '/auth/sign-up/email' } as any;
    const mockRes = {} as any;

    await controller.handleAuth(mockReq, mockRes);

    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);
  });

  it('should handle verify-email requests', async () => {
    const mockReq = { url: '', originalUrl: '/auth/verify-email?token=abc123' } as any;
    const mockRes = {} as any;

    await controller.handleAuth(mockReq, mockRes);

    expect(mockReq.url).toBe('/auth/verify-email?token=abc123');
    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);
  });
});
