import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthProvider';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorProvider } from './context/ErrorProvider';
import { SocketProvider } from './context/SocketProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AuthProvider>
        <BrowserRouter>
            <SocketProvider>
                <ErrorProvider>
                    <Routes>
                        <Route path="/*" element={<App />} />
                    </Routes>
                </ErrorProvider>
            </SocketProvider>
        </BrowserRouter>
    </AuthProvider>,
);
