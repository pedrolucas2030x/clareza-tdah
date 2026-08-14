jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

import * as SecureStore from 'expo-secure-store';
import { secureStoreAdapter } from '../secureStoreAdapter';

describe('secureStoreAdapter', () => {
  it('delegates getItem to SecureStore.getItemAsync', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('value');
    const result = await secureStoreAdapter.getItem('key');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('key');
    expect(result).toBe('value');
  });

  it('delegates setItem to SecureStore.setItemAsync', async () => {
    await secureStoreAdapter.setItem('key', 'value');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('key', 'value');
  });

  it('delegates removeItem to SecureStore.deleteItemAsync', async () => {
    await secureStoreAdapter.removeItem('key');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('key');
  });
});
