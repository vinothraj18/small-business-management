import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Customers from './pages/Customers';
import Reports from './pages/Reports';

const ProtectedLayout = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedLayout>
          <Dashboard />
        </ProtectedLayout>
      } />

      <Route path="/products" element={
        <ProtectedLayout>
          <Products />
        </ProtectedLayout>
      } />

      <Route path="/sales" element={
        <ProtectedLayout>
          <Sales />
        </ProtectedLayout>
      } />

      <Route path="/expenses" element={
        <ProtectedLayout>
          <Expenses />
        </ProtectedLayout>
      } />

      <Route path="/customers" element={
        <ProtectedLayout>
          <Customers />
        </ProtectedLayout>
      } />

      <Route path="/reports" element={
        <ProtectedLayout>
          <Reports />
        </ProtectedLayout>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
