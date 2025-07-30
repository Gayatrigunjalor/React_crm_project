import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load environment variables based on the current mode
    const env = loadEnv(mode, process.cwd(), 'development');

    return {
        plugins: [laravel(['resources/js/index.tsx', 'resources/css/scss/theme.scss', 'resources/css/scss/user.scss'])],
        build: {
            outDir: 'public/build', // Specify output directory for built assets
            // Suppress TypeScript warnings
            rollupOptions: {
                onwarn(warning, warn) {
                // Ignore TypeScript warnings
                if (warning.code === 'UNUSED_EXTERNAL_IMPORT' && /typescript/.test(warning.message)) {
                    return; // Skip this warning
                }
                warn(warning); // Log other warnings
                }
            }
        },
    };
});