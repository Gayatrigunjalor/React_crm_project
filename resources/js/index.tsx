import AppProvider from './providers/AppProvider';
import React from 'react';
import ReactDOM from 'react-dom/client';
import BreakpointsProvider from './providers/BreakpointsProvider';
import SettingsPanelProvider from './providers/SettingsPanelProvider';
import { RouterProvider } from 'react-router-dom';
import { router } from './Routes';
import { AuthProvider } from './AuthContext'

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <AppProvider>
            <SettingsPanelProvider>
                <BreakpointsProvider>
                    <AuthProvider>
                        <RouterProvider router={router} />
                    </AuthProvider>
                </BreakpointsProvider>
            </SettingsPanelProvider>
        </AppProvider>
    </React.StrictMode>
);
