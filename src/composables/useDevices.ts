import { ref, type Ref } from 'vue';
import { appConfig } from '@/config/appConfig';
import { useAuth0 } from '@auth0/auth0-vue';

export type Device = {
  id: string;
  brand: string;
  model: string;
  category: string;
  available?: number;
};

export function useDevices() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const devices: Ref<Device[]> = ref([]);
  const loading = ref(false);
  const error: Ref<string | null> = ref(null);

  const fetchDevices = async () => {
    if (loading.value) return;

    loading.value = true;
    error.value = null;

    // ✅ Safe URL construction (keeps /api)
    const base = appConfig.apiBaseUrl.replace(/\/$/, '');
    const url = `${base}/devices`;

    console.log('🔄 [useDevices] fetchDevices start', {
      url,
      isAuthenticated: isAuthenticated.value,
    });

    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };

      if (isAuthenticated.value) {
        try {
          const token = await getAccessTokenSilently();
          if (token) {
            headers.Authorization = `Bearer ${token}`;
            console.log('🔑 [useDevices] token attached (Bearer)');
          } else {
            console.warn('⚠️ [useDevices] getAccessTokenSilently returned empty token');
          }
        } catch (e) {
          console.warn('⚠️ [useDevices] getAccessTokenSilently failed, continuing public', e);
        }
      } else {
        console.log('👤 [useDevices] not logged in → public request');
      }

      const res = await fetch(url, { headers });

      console.log('📡 [useDevices] response', {
        status: res.status,
        ok: res.ok,
        statusText: res.statusText,
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch devices: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      devices.value = Array.isArray(data) ? data : [];

      console.log('✅ [useDevices] devices loaded', { count: devices.value.length });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      console.error('🔥 [useDevices] fetchDevices error', e);
      error.value = msg;
    } finally {
      loading.value = false;
      console.log('🏁 [useDevices] fetchDevices end');
    }
  };

  return { devices, loading, error, fetchDevices };
}
