import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import Devices from './Devices.vue'

// ✅ mock Auth0 (required)
vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: () => ({
    isAuthenticated: ref(false),
    getAccessTokenSilently: vi.fn(),
  }),
}))

// ✅ mock fetch used by useDevices
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  } as any)
)

describe('Devices view', () => {
  it('renders heading', () => {
    const wrapper = mount(Devices)
    expect(wrapper.text()).toContain('Devices')
  })
})
