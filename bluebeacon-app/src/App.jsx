import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import CivilianLayout from './components/layout/CivilianLayout';
import Layout from './components/layout/Layout';
import Login from './pages/Login';

// Civilian
import CivilianDashboard from './pages/civilian/Dashboard';
import ReportIncident from './pages/civilian/ReportIncident';
import MyReports from './pages/civilian/MyReports';
import LiveMap from './pages/civilian/LiveMap';
import Alerts from './pages/civilian/Alerts';
import ClearanceCert from './pages/civilian/ClearanceCert';
import PayFines from './pages/civilian/PayFines';
import BookAppointment from './pages/civilian/BookAppointment';
import VictimSupport from './pages/civilian/VictimSupport';
import AccountSettings from './pages/civilian/AccountSettings';

// Officer
import OfficerDashboard from './pages/officer/Dashboard';
import IncidentQueue from './pages/officer/IncidentQueue';
import DocketManager from './pages/officer/DocketManager';
import DispatchBoard from './pages/officer/DispatchBoard';
import PatrolMap from './pages/officer/PatrolMap';
import Arrests from './pages/officer/Arrests';
import BailApplications from './pages/officer/BailApplications';
import EvidenceLocker from './pages/officer/EvidenceLocker';
import WarrantRequests from './pages/officer/WarrantRequests';
import CellBoard from './pages/officer/CellBoard';
import NameCheck from './pages/officer/NameCheck';
import Comms from './pages/officer/Comms';
import ShiftManagement from './pages/officer/ShiftManagement';

// Judge
import JudgeDashboard from './pages/judge/Dashboard';
import WarrantInbox from './pages/judge/WarrantInbox';
import BailReview from './pages/judge/BailReview';
import CaseFiles from './pages/judge/CaseFiles';
import SignedWarrants from './pages/judge/SignedWarrants';
import CourtOrders from './pages/judge/CourtOrders';
import Archives from './pages/judge/Archives';

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/civilian"
        element={
          <ProtectedRoute requiredRole="civilian">
            <CivilianLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<CivilianDashboard />} />
        <Route path="report" element={<ReportIncident />} />
        <Route path="my-reports" element={<MyReports />} />
        <Route path="map" element={<LiveMap />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="clearance" element={<ClearanceCert />} />
        <Route path="fines" element={<PayFines />} />
        <Route path="appointments" element={<BookAppointment />} />
        <Route path="support" element={<VictimSupport />} />
        <Route path="settings" element={<AccountSettings />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route path="/officer" element={<ProtectedRoute requiredRole="officer"><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<OfficerDashboard />} />
        <Route path="incidents" element={<IncidentQueue />} />
        <Route path="dockets" element={<DocketManager />} />
        <Route path="dispatch" element={<DispatchBoard />} />
        <Route path="map" element={<PatrolMap />} />
        <Route path="arrests" element={<Arrests />} />
        <Route path="bail" element={<BailApplications />} />
        <Route path="evidence" element={<EvidenceLocker />} />
        <Route path="warrants" element={<WarrantRequests />} />
        <Route path="cells" element={<CellBoard />} />
        <Route path="namecheck" element={<NameCheck />} />
        <Route path="comms" element={<Comms />} />
        <Route path="shifts" element={<ShiftManagement />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route path="/judge" element={<ProtectedRoute requiredRole="judge"><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<JudgeDashboard />} />
        <Route path="warrants" element={<WarrantInbox />} />
        <Route path="bail" element={<BailReview />} />
        <Route path="cases" element={<CaseFiles />} />
        <Route path="signed-warrants" element={<SignedWarrants />} />
        <Route path="orders" element={<CourtOrders />} />
        <Route path="archives" element={<Archives />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
