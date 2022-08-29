import React from 'react';
import { Dashboard, Login, Error, AuthWrapper } from './pages';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const { user } = useAuth0();

  return (
    <AuthWrapper>
      <BrowserRouter>
        <Routes>
          <Route
            path='/'
            element={user ? <Dashboard /> : <Navigate replace to='/login' />}
          />
          <Route path='/login' element={<Login />} />
          <Route path='*' element={<Error />} />
        </Routes>
      </BrowserRouter>
    </AuthWrapper>
  );
}

export default App;
