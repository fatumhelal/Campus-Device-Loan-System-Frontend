import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'

// ✅ mock Auth0 FIRST
vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: () => ({
    isAuthenticated: ref(false),
    getAccessTokenSilently: vi.fn(),
  }),
}))

// ✅ mock fetch used by useDevices inside Devices.vue
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => [],
  } as any)
)

import { mount } from '@vue/test-utils'
import Devices from './Devices.vue'

describe('Devices view', () => {
  it('renders heading', () => {
    const wrapper = mount(Devices)

    expect(wrapper.text()).toContain('Devices')
  })
})
