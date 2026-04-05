import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import httpStatus from 'http-status';
import server from '../environment';

export const AuthContext = createContext({});

// Axios client pointed at backend
const client = axios.create({
    baseURL: `${server}/api/v1/users`
});

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    // Register new user
    const handleRegister = async (name, username, password) => {
        try {
            const response = await client.post('/register', { name, username, password });
            if (response.status === httpStatus.CREATED) {
                return response.data.message;
            }
        } catch (err) {
            throw err;
        }
    };

    // Login - stores JWT token in localStorage
    const handleLogin = async (username, password) => {
        try {
            const response = await client.post('/login', { username, password });
            if (response.status === httpStatus.OK) {
                localStorage.setItem('token', response.data.token);
                // Store basic user info so pages can read name etc.
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setUserData(response.data.user);
                navigate('/home');
            }
        } catch (err) {
            throw err;
        }
    };

    // Fetch meeting history for logged-in user
    const getHistoryOfUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await client.get('/get_all_activity', {
                params: { token }
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    // Add a meeting code to user history
    const addToUserHistory = async (meetingCode) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return; // guest users skip history
            const response = await client.post('/add_to_activity', {
                token,
                meeting_code: meetingCode
            });
            return response;
        } catch (err) {
            // Don't crash the meeting if history save fails
            console.warn('Could not save meeting to history:', err.message);
        }
    };

    // Get stored user info from localStorage
    const getStoredUser = () => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    };

    const value = {
        userData,
        setUserData,
        getStoredUser,
        handleRegister,
        handleLogin,
        getHistoryOfUser,
        addToUserHistory
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
