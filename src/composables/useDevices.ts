// CI Trigger
import { ref, type Ref, watch } from 'vue';
import { appConfig } from '@/config/appConfig';
import { useAuth0 } from '@auth0/auth0-vue';

export type Device = {
  id: string;
  brand: string;
  model: string;
  category: string;
  isAvailable: boolean;
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

    const base = appConfig.apiBaseUrl.replace(/\/$/, '');
    const url = `${base}/devices`;

    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };

      if (isAuthenticated.value) {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error('Failed to fetch devices');

      const data = await res.json();

      devices.value = Array.isArray(data)
        ? data.map((d) => ({
            id: d.id,
            brand: d.brand,
            model: d.model,
            category: d.category,
            isAvailable: d.isAvailable === true,
          }))
        : [];
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  };

  const reserveDevice = async (deviceId: string) => {
    const base = appConfig.apiBaseUrl.replace(/\/$/, '');
    const url = `${base}/devices/${deviceId}/reserve`;
  
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });
  
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error ?? 'Unable to reserve device');
    }
  
    // 🔒 SAFE JSON PARSE (CRITICAL FIX)
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  
    await fetchDevices();
  
    return data; // may be null — frontend handles it safely
  };  

  watch(isAuthenticated, (newVal, oldVal) => {
    if (newVal && !oldVal) {
      fetchDevices();
    }
  });

  return {
    devices,
    loading,
    error,
    fetchDevices,
    reserveDevice,
  };
}
