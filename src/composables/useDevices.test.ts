import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useDevices } from './useDevices'

// ✅ mock Auth0
vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: () => ({
    isAuthenticated: ref(false),
    getAccessTokenSilently: vi.fn(),
  }),
}))

// ✅ mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve([
        { id: '1', brand: 'Apple', model: 'MacBook', category: 'Laptop' },
      ]),
  } as any)
)

describe('useDevices', () => {
  it('fetches devices successfully', async () => {
    const { devices, fetchDevices } = useDevices()

    await fetchDevices()

    expect(devices.value.length).toBe(1)
    expect(devices.value[0].brand).toBe('Apple')
  })
})
