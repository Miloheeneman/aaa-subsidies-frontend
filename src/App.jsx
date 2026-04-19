import { Route, Routes } from "react-router-dom";

import AdminRoute from "./components/AdminRoute.jsx";
import InstallateurRoute from "./components/InstallateurRoute.jsx";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AanvraagDetail from "./pages/AanvraagDetail.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Landing from "./pages/Landing.jsx";
import NieuweAanvraag from "./pages/NieuweAanvraag.jsx";
import NotFound from "./pages/NotFound.jsx";
import SubsidieCheck from "./pages/SubsidieCheck.jsx";
import AdminAanvraagBeheer from "./pages/admin/AanvraagBeheer.jsx";
import AdminAanvraagDetail from "./pages/admin/AanvraagDetail.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminKlantenBeheer from "./pages/admin/KlantenBeheer.jsx";
import AdminRegelingenBeheer from "./pages/admin/RegelingenBeheer.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import Abonnement from "./pages/installateur/Abonnement.jsx";
import DossierDetail from "./pages/installateur/DossierDetail.jsx";
import DossiersOverzicht from "./pages/installateur/DossiersOverzicht.jsx";
import InstallateurDashboard from "./pages/installateur/InstallateurDashboard.jsx";
import LeadsOverzicht from "./pages/installateur/LeadsOverzicht.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/subsidiecheck" element={<SubsidieCheck />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/aanvraag/nieuw" element={<NieuweAanvraag />} />
          <Route path="/aanvraag/:id" element={<AanvraagDetail />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/aanvragen" element={<AdminAanvraagBeheer />} />
          <Route
            path="/admin/aanvraag/:id"
            element={<AdminAanvraagDetail />}
          />
          <Route path="/admin/klanten" element={<AdminKlantenBeheer />} />
          <Route
            path="/admin/regelingen"
            element={<AdminRegelingenBeheer />}
          />
        </Route>

        <Route element={<InstallateurRoute />}>
          <Route
            path="/installateur/dashboard"
            element={<InstallateurDashboard />}
          />
          <Route path="/installateur/leads" element={<LeadsOverzicht />} />
          <Route
            path="/installateur/dossiers"
            element={<DossiersOverzicht />}
          />
          <Route
            path="/installateur/dossier/:id"
            element={<DossierDetail />}
          />
          <Route path="/installateur/abonnement" element={<Abonnement />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
