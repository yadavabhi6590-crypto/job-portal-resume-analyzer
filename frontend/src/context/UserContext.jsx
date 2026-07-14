import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import api from '../utils/api';
import { setGetTokenFn } from '../utils/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
    const { getToken } = useAuth();
    const [mongoUser, setMongoUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (clerkLoaded && clerkUser) {
            setGetTokenFn(getToken);
            syncUser();
        } else if (clerkLoaded && !clerkUser) {
            setMongoUser(null);
            setLoading(false);
        }
    }, [clerkLoaded, clerkUser]);

    const syncUser = async () => {
        try {
            const res = await api.post('/user/sync', {
                email: clerkUser.primaryEmailAddress?.emailAddress,
                fullName: clerkUser.fullName,
                profilePicture: clerkUser.imageUrl
            });
            setMongoUser(res.user);
        } catch (err) {
            console.error('User sync failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = mongoUser?.role === 'Admin';

    return (
        <UserContext.Provider value={{ mongoUser, loading, isAdmin, refreshUser: syncUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useMongoUser = () => useContext(UserContext);
