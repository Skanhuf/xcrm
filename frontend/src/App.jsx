import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import Clients from './pages/Clients';
import Warehouse from './pages/Warehouse';
import Finance from './pages/Finance';
import NewOrder from './pages/NewOrder';
import Cars from './pages/Cars';
import OrderDetail from './pages/OrderDetail';
import Layout from './components/Layout';

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/kanban" element={<KanbanBoard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/warehouse" element={<Warehouse />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/order/new" element={<NewOrder />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
