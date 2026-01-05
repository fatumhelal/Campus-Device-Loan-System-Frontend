// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import Devices from './Devices.vue'

// ✅ mock Auth0 (must include BOTH isAuthenticated and user)
vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: () => ({
    isAuthenticated: ref(false),
    user: ref(null),
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
  it('renders heading for unauthenticated users', () => {
    const wrapper = mount(Devices)

    // unauthenticated users see "Available Devices"
    expect(wrapper.text()).toContain('Available Devices')
  })
})
