import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
    },
});

/* ------------------------------------------------------------------ */
/*  Request Interceptor: đính kèm Bearer token                        */
/* ------------------------------------------------------------------ */

apiClient.interceptors.request.use((config) => {
    const token = Cookies.get('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/* ------------------------------------------------------------------ */
/*  Response Interceptor: auto refresh token khi 401                   */
/* ------------------------------------------------------------------ */

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (config: InternalAxiosRequestConfig) => void;
    reject: (error: AxiosError) => void;
}> = [];

function processQueue(error: AxiosError | null, token: string | null = null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else if (token) {
            resolve({ headers: { Authorization: `Bearer ${token}` } } as InternalAxiosRequestConfig);
        }
    });
    failedQueue = [];
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Không xử lý refresh token/redirect nếu là request login
        const isLoginRequest = originalRequest.url?.includes('/auth/login');

        // Nếu 401 và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
            // Nếu đang refresh → queue request lại
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((config) => {
                    return apiClient(Object.assign({}, originalRequest, config));
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const accessToken = Cookies.get('accessToken');
            const refreshToken = Cookies.get('refreshToken');

            if (!accessToken || !refreshToken) {
                isRefreshing = false;
                clearAuthCookies();
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
                    { accessToken, refreshToken },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
                        },
                    }
                );

                const newAccessToken = data.data.accessToken;
                Cookies.set('accessToken', newAccessToken, { path: '/' });

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);

                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError as AxiosError, null);
                clearAuthCookies();
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

function clearAuthCookies() {
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });
}

export { clearAuthCookies };
export default apiClient;