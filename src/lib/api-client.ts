import moment from 'moment-timezone';

export function downloadURI(uri: string, name: string): void {
  const link: HTMLAnchorElement = document.createElement('a');
  link.download = name;
  link.href = uri;
  link.target = '_blank'; // Open in a new tab (optional)
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const host: string =
  process.env.NEXT_PUBLIC_SITE_BACKEND_HOST || 'http://localhost:3005/api';

// Helper function to get a cookie value
export function getCookie(name: string): string | null {
  let cookieValue: string | null = null;
  if (document.cookie && document.cookie !== '') {
    const cookies: string[] = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie: string = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === `${name}=`) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export interface CommonResponseType {
  data: any;
  message: string;
  status: number;
  error?: string;
}

// Helper function to build headers
export function buildHeaders(
  extraHeaders: Record<string, string> = {},
  token?: string
): HeadersInit {
  const headers: HeadersInit = {
    Pragma: 'no-cache',
    'Cache-Control': 'no-cache',
    'Client-Timezone-Name': moment.tz.guess()
  };

  if (token && token !== '') {
    // const token = JSON.parse(localStorage.getItem('token') || '{}');
    headers['Authorization'] = `Bearer ${token}`;
  }

  return { ...headers, ...extraHeaders };
}

// GET request
export async function get(
  uri: string,
  params: Record<string, any> = {},
  options: RequestInit = {}
): Promise<CommonResponseType> {
  const url = new URL(`${host}${uri}`);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: buildHeaders(),
    ...options
  });

  const responseData = await response.json(); // Parse the response JSON

  if (!response.ok) {
    // Return the full response object with status and message
    return {
      status: response.status,
      message: responseData.message || 'An error occurred',
      data: null
    };
  }

  // Return the full response object for successful requests
  return {
    status: response.status,
    message: responseData.message || 'Request successful',
    data: responseData.data
  };
}

// POST request
export async function post(
  uri: string,
  body: Record<string, any> = {}
): Promise<CommonResponseType> {
  const response = await fetch(`${host}${uri}`, {
    method: 'POST',
    headers: buildHeaders({
      'X-CSRFToken': getCookie('csrftoken') || ''
    }),
    body: JSON.stringify(body)
  });

  const responseData = await response.json(); // Parse the response JSON

  if (!response.ok) {
    // Return the full response object with status and message
    return {
      status: response.status,
      message: responseData.message || 'An error occurred',
      data: null
    };
  }

  // Return the full response object for successful requests
  return {
    status: response.status,
    message: responseData.message || 'Request successful',
    data: responseData.data
  };
}

// Authorized GET request
export async function authorizedGet(
  uri: string,
  token: string,
  params: Record<string, any> = {}
): Promise<CommonResponseType> {
  const url = new URL(`${host}${uri}`);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: buildHeaders({}, token)
  });

  const responseData = await response.json(); // Parse the response JSON

  if (!response.ok) {
    // Return the full response object with status and message
    return {
      status: response.status,
      message: responseData.message || 'An error occurred',
      data: null
    };
  }

  // Return the full response object for successful requests
  return {
    status: response.status,
    message: responseData.message || 'Request successful',
    data: responseData.data
  };
}

// Authorized POST request
export async function authorizedPost(
  uri: string,
  token: string,
  body: Record<string, any> = {},
  params: Record<string, any> = {}
): Promise<CommonResponseType> {
  const url = new URL(`${host}${uri}`);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: buildHeaders(
      {
        'X-CSRFToken': getCookie('csrftoken') || ''
      },
      token
    ),
    body: JSON.stringify(body)
  });

  const responseData = await response.json(); // Parse the response JSON

  if (!response.ok) {
    // Return the full response object with status and message
    return {
      status: response.status,
      message: responseData.message || 'An error occurred',
      data: null
    };
  }

  // Return the full response object for successful requests
  return {
    status: response.status,
    message: responseData.message || 'Request successful',
    data: responseData.data
  };
}

// Authorized DELETE request
export async function authorizedDelete<T>(
  uri: string,
  token: string,
  params: Record<string, any> = {}
): Promise<T> {
  const url = new URL(`${host}${uri}`);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: buildHeaders(
      {
        'X-CSRFToken': getCookie('csrftoken') || ''
      },
      token
    )
  });

  if (!response.ok) {
    throw new Error(`Authorized DELETE request failed: ${response.statusText}`);
  }

  return response.json();
}

// Authorized PATCH request
export async function authorizedPatch<T>(
  uri: string,
  token: string,
  body: Record<string, any> = {},
  params: Record<string, any> = {}
): Promise<T> {
  const url = new URL(`${host}${uri}`);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );
  const response = await fetch(url.toString(), {
    method: 'PATCH',
    headers: buildHeaders(
      {
        'X-CSRFToken': getCookie('csrftoken') || ''
      },
      token
    ),
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Authorized PATCH request failed: ${response.statusText}`);
  }

  return response.json();
}

// Authorized POST request for file upload
export async function authorizedPostUpload<T>(
  uri: string,
  token: string,
  body: FormData,
  params: Record<string, any> = {}
): Promise<T> {
  const url = new URL(`${host}${uri}`);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: buildHeaders(
      {
        'X-CSRFToken': getCookie('csrftoken') || ''
      },
      token
    ),
    body
  });

  if (!response.ok) {
    throw new Error(
      `Authorized POST upload request failed: ${response.statusText}`
    );
  }

  return response.json();
}

// Authorized PATCH request for file upload
export async function authorizedPatchUpload<T>(
  uri: string,
  token: string,
  body: FormData,
  params: Record<string, any> = {}
): Promise<T> {
  const url = new URL(`${host}${uri}`);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );

  const response = await fetch(url.toString(), {
    method: 'PATCH',
    headers: buildHeaders(
      {
        'X-CSRFToken': getCookie('csrftoken') || ''
      },
      token
    ),
    body
  });

  if (!response.ok) {
    throw new Error(
      `Authorized PATCH upload request failed: ${response.statusText}`
    );
  }

  return response.json();
}

// Authorized file download
export async function authorizedFileDownload(
  uri: string,
  token: string,
  fileType: string = 'text/csv,charset=UTF-8',
  fileName: string = 'export'
): Promise<void> {
  const response = await fetch(`${host}${uri}`, {
    method: 'GET',
    headers: buildHeaders({}, token)
  });

  if (!response.ok) {
    throw new Error(`File download failed: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  downloadURI(url, fileName);
}
