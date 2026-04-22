// frontend/src/hooks/useCredential.js
import { useState, useCallback } from 'react';
import { useCopyToClipboard } from './useCopyToClipboard';

export function useCredential() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { copyToClipboard } = useCopyToClipboard();

    const fetchCredential = useCallback(async (key, environment = 'int') => {
        setIsLoading(true);
        setError(null);
        try {
            const url = environment ? `/api/credentials/${encodeURIComponent(key)}?key=${environment}` : `/api/credentials/${encodeURIComponent(key)}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.success && (data.credential || data.data || data.token)) {
                const credential = data.credential || data.data || data.token;
                return credential;
            } else if (data.data) {
                return data.data; // Handle cases where there's only a data field
            }
            else {
                throw new Error('No credential found in response');
            }
        } catch (err) {
            console.error('❌ Failed to fetch credential:', err);
            setError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getCredentialAndCopy = useCallback(async (key, environment) => {
        const credential = await fetchCredential(key, environment);
        if (credential) {
            await copyToClipboard(credential);
            return true;
        }
        return false;
    }, [fetchCredential, copyToClipboard]);

    return { fetchCredential, getCredentialAndCopy, isLoading, error };
}