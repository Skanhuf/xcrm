import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Login from '../pages/Login';
import { useAuthStore } from '../store/authStore';

vi.mock('../store/authStore', () => ({
  useAuthStore: {
    getState: () => ({ isAuthenticated: false }),
    subscribe: () => () => {},
  },
  default: {
    getState: () => ({ isAuthenticated: false }),
    subscribe: () => () => {},
  },
}));

vi.mock('../services/auth', () => ({
  login: vi.fn().mockResolvedValue({ access_token: 'test-token' }),
}));

describe('Login Page', () => {
  it('renders login form', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText('admin')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Войти')).toBeInTheDocument();
  });

  it('shows demo mode button', () => {
    render(<Login />);
    expect(screen.getByText('Демо-режим (без сервера)')).toBeInTheDocument();
  });
});
