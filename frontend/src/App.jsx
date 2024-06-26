import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Thay đổi URL thành URL ngrok khi triển khai

function App() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // Kết nối và nhận dữ liệu cập nhật từ server
        socket.on('update_avatar', (updatedUser) => {
            setUsers((prevUsers) => 
                prevUsers.map(user => user._id === updatedUser._id ? updatedUser : user)
            );
        });

        return () => {
            socket.off('update_avatar');
        };
    }, []);

    const { data: authUser, isLoading } = useQuery({
        // we use queryKey to give a unique name to our query and refer to it later
        queryKey: ["authUser"],
        queryFn: async () => {
            try {
                const res = await fetch("/api/auth/me");
                const data = await res.json();
                if (data.error) return null;
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong");
                }
                console.log("authUser is here:", data);
                return data;
            } catch (error) {
                throw new Error(error);
            }
        },
        retry: false,
    });

    if (isLoading) {
        return (
            <div className='h-screen flex justify-center items-center'>
                <LoadingSpinner size='lg' />
            </div>
        );
    }

    return (
        <div className='flex max-w-6xl mx-auto'>
            {/* Common component, bc it's not wrapped with Routes */}
            {authUser && <Sidebar />}
            <Routes>
                <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
                <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
                <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
                <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
                <Route path='/profile/:username' element={authUser ? <ProfilePage users={users} /> : <Navigate to='/login' />} />
            </Routes>
            {authUser && <RightPanel />}
            <Toaster />
        </div>
    );
}

export default App;
