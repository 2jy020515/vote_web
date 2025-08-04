import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  const userHash = localStorage.getItem('userHash');

  if (!token || !userHash) {
    alert('로그인이 필요한 페이지입니다.');
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
