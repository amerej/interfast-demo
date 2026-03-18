export const auth = {
  api: {
    getSession: jest.fn().mockResolvedValue(null),
  },
};

export type Auth = typeof auth;
