import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setGetTokenFn } from '../utils/api';
import api from '../utils/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const { getToken, isSignedIn } = useAuth();
    const [latestAnalysis, setLatestAnalysis] = useState(null);
    const [latestTestResult, setLatestTestResult] = useState(null);

    useEffect(() => {
        setGetTokenFn(getToken);
    }, [getToken]);

    useEffect(() => {
        if (!isSignedIn) return;
        api.get('/resume/latest').then(data => setLatestAnalysis(data.analysis)).catch(() => { });
        api.get('/test/').then(data => {
            if (data.results?.length) setLatestTestResult(data.results[0]);
        }).catch(() => { });
    }, [isSignedIn]);

    return (
        <AppContext.Provider value={{ latestAnalysis, setLatestAnalysis, latestTestResult, setLatestTestResult }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);
