import { DEFAULT_CURRENCY, DEFAULT_LANGUAGE, DEFAULT_THEME, SUPPORTED_LANGUAGES } from '../index';

describe('type defaults', () => {
  it('defaults to Brazilian Portuguese', () => {
    expect(DEFAULT_LANGUAGE).toBe('pt-BR');
  });

  it('defaults to auto theme', () => {
    expect(DEFAULT_THEME).toBe('auto');
  });

  it('defaults currency to BRL', () => {
    expect(DEFAULT_CURRENCY).toBe('BRL');
  });

  it('supports pt-BR and en', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['pt-BR', 'en']);
  });
});

import type { Profile } from '../index';

describe('Profile shape', () => {
  it('accepts a full profile object', () => {
    const profile: Profile = {
      id: 'user-1',
      fullName: 'Ana Silva',
      avatarUrl: null,
      language: 'pt-BR',
      theme: 'auto',
      currency: 'BRL',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };
    expect(profile.id).toBe('user-1');
  });
});
