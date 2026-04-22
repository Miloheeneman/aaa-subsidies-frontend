import { Route, Routes } from "react-router-dom";

import AdminRoute from "./components/AdminRoute.jsx";
import InstallateurRoute from "./components/InstallateurRoute.jsx";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AanvraagDetail from "./pages/AanvraagDetail.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Contact from "./pages/Contact.jsx";
import HoeHetWerkt from "./pages/HoeHetWerkt.jsx";
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
import OnboardingPlan from "./pages/onboarding/OnboardingPlan.jsx";
import OnboardingSuccess from "./pages/onboarding/OnboardingSuccess.jsx";
import MaatregelDossier from "./pages/projecten/MaatregelDossier.jsx";
import EiaAanvraagWizard from "./pages/projecten/EiaAanvraagWizard.jsx";
import MiaVamilAanvraagWizard from "./pages/projecten/MiaVamilAanvraagWizard.jsx";
import DumavaAanvraagWizard from "./pages/projecten/DumavaAanvraagWizard.jsx";
import IsdeIsolatieAanvraagWizard from "./pages/projecten/IsdeIsolatieAanvraagWizard.jsx";
import IsdeWarmtepompAanvraagWizard from "./pages/projecten/IsdeWarmtepompAanvraagWizard.jsx";
import NieuwProject from "./pages/projecten/NieuwProject.jsx";
import ProjectDetail from "./pages/projecten/ProjectDetail.jsx";
import ProjectenOverzicht from "./pages/projecten/ProjectenOverzicht.jsx";
import AdminProjectenBeheer from "./pages/admin/ProjectenBeheer.jsx";
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
        <Route path="/hoe-het-werkt" element={<HoeHetWerkt />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/aanvraag/nieuw" element={<NieuweAanvraag />} />
          <Route path="/aanvraag/:id" element={<AanvraagDetail />} />
          <Route path="/projecten" element={<ProjectenOverzicht />} />
          <Route path="/projecten/nieuw" element={<NieuwProject />} />
          <Route path="/projecten/:id" element={<ProjectDetail />} />
          <Route
            path="/projecten/:projectId/aanvragen/isde-warmtepomp"
            element={<IsdeWarmtepompAanvraagWizard />}
          />
          <Route
            path="/projecten/:projectId/aanvragen/isde-isolatie"
            element={<IsdeIsolatieAanvraagWizard />}
          />
          <Route
            path="/projecten/:projectId/aanvragen/eia"
            element={<EiaAanvraagWizard />}
          />
          <Route
            path="/projecten/:projectId/aanvragen/mia-vamil"
            element={<MiaVamilAanvraagWizard />}
          />
          <Route
            path="/projecten/:projectId/aanvragen/dumava"
            element={<DumavaAanvraagWizard />}
          />
          <Route
            path="/projecten/:projectId/maatregelen/:maatregelId"
            element={<MaatregelDossier />}
          />
          <Route path="/onboarding/plan" element={<OnboardingPlan />} />
          <Route path="/onboarding/success" element={<OnboardingSuccess />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/aanvragen" element={<AdminAanvraagBeheer />} />
          <Route
            path="/admin/aanvraag/:id"
            element={<AdminAanvraagDetail />}
          />
          <Route path="/admin/klanten" element={<AdminKlantenBeheer />} />
          <Route path="/admin/projecten" element={<AdminProjectenBeheer />} />
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
