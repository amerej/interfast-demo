export const betterAuth = jest.fn(() => ({
  api: { getSession: jest.fn() },
}));
