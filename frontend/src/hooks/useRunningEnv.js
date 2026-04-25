// src/hooks/useRunningEnv.js
import { useState, useEffect } from 'react';

export const useRunningEnv = () => {
    const [runningEnv, setRunningEnv] = useState('unknown'); // 'docker', 'shell', 'unknown'
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const detectEnvironment = async () => {
            try {
                // Method 1: Check by environment variable (set in .env)
                if (process.env.REACT_APP_RUNNING_ENV === 'docker') {
                    setRunningEnv('docker');
                    setIsLoading(false);
                    return;
                }
                if (process.env.REACT_APP_RUNNING_ENV === 'shell') {
                    setRunningEnv('shell');
                    setIsLoading(false);
                    return;
                }

                // Method 2: Try Docker-specific endpoint
                try {
                    const dockerResponse = await fetch('/api/env/docker', {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        signal: AbortSignal.timeout(2000)
                    });

                    if (dockerResponse.ok) {
                        const data = await dockerResponse.json();
                        if (data.runningIn === 'docker') {
                            setRunningEnv('docker');
                            setIsLoading(false);
                            return;
                        }
                    }
                } catch (error) {
                    // Docker endpoint not available, continue to check shell
                    console.log('Docker endpoint not available');
                }

                // Method 3: Try shell-specific endpoint
                try {
                    const shellResponse = await fetch('/api/env/shell', {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        signal: AbortSignal.timeout(2000)
                    });

                    if (shellResponse.ok) {
                        const data = await shellResponse.json();
                        if (data.runningIn === 'shell') {
                            setRunningEnv('shell');
                            setIsLoading(false);
                            return;
                        }
                    }
                } catch (error) {
                    console.log('Shell endpoint not available');
                }

                // Method 4: Check hostname or other indicators
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    // Default to shell if running locally
                    setRunningEnv('shell');
                } else {
                    setRunningEnv('docker');
                }
            } catch (error) {
                console.error('Error detecting environment:', error);
                setRunningEnv('unknown');
            } finally {
                setIsLoading(false);
            }
        };

        detectEnvironment();
    }, []);

    return { runningEnv, isLoading, isDocker: runningEnv === 'docker', isShell: runningEnv === 'shell' };
};