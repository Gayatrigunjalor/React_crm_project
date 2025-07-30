/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PUBLIC_URL: string; // Add your environment variables here
    // Add more variables as needed
    readonly VITE_REACT_APP_TITLE: string;
    readonly REACT_APP_VERSION: string;
    readonly VITE_API_URL: string;
    readonly VITE_GOOGLE_LOGIN_ENABLED: number;
    readonly VITE_APP_URL: string;
    readonly VITE_APP_ENV: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
