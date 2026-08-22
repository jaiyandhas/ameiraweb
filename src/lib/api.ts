import { supabase } from './supabase';
import type { CapabilityId } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return {};
  }
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data?: T; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: json.detail || json.message || `Request failed with status ${res.status}` };
    }
    return { data: json };
  } catch (err: any) {
    return { error: err?.message || 'Network error connecting to enforcement service.' };
  }
}

// ─── Enforcement API Endpoints ───────────────────────────────────────────────

export async function apiUpdatePersonRole(personId: string, roleId: string) {
  return request<{ success: boolean; role_name?: string }>(`/api/people/${personId}/role`, {
    method: 'POST',
    body: JSON.stringify({ role_id: roleId }),
  });
}

export async function apiRemovePerson(personId: string) {
  return request<{ success: boolean; removed_person_id: string }>(`/api/people/${personId}/remove`, {
    method: 'POST',
  });
}

export async function apiCreateRole(name: string, description: string, capabilities: CapabilityId[]) {
  return request<{ success: boolean; id: string; name: string }>(`/api/roles`, {
    method: 'POST',
    body: JSON.stringify({ name, description, capabilities }),
  });
}

export async function apiUpdateRole(roleId: string, name: string, description: string, capabilities: CapabilityId[]) {
  return request<{ success: boolean; id: string; name: string }>(`/api/roles/${roleId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, description, capabilities }),
  });
}

export async function apiDeleteRole(roleId: string) {
  return request<{ success: boolean; deleted_role_id: string }>(`/api/roles/${roleId}`, {
    method: 'DELETE',
  });
}

export async function apiAcceptInvite(inviteId: string) {
  return request<{ success: boolean; person_id: string; business_id: string }>(`/api/invites/${inviteId}/accept`, {
    method: 'POST',
  });
}
