import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

// ✅ mock Auth0 FIRST (before importing useDevices)
vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: () => ({
    isAuthenticated: ref(false),
    getAccessTokenSilently: vi.fn(),
  }),
}))

// ✅ mock fetch
global.fetch = vi.fn()

import { useDevices } from './useDevices'

describe('useDevices', () => {
  beforeEach(() => {
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [
        { id: '1', brand: 'Apple', model: 'MacBook', category: 'Laptop' },
      ],
    })
  })

  it('fetches devices successfully', async () => {
    const { devices, fetchDevices } = useDevices()

    await fetchDevices()

    expect(devices.value.length).toBe(1)
    expect(devices.value[0]!.brand).toBe('Apple')
  })
})
