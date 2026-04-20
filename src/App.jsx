import { Route, Routes } from "react-router-dom";

import AdminRoute from "./components/AdminRoute.jsx";
import InstallateurRoute from "./components/InstallateurRoute.jsx";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import SiteLayout from "./components/site/SiteLayout.jsx";
import AanvraagDetail from "./pages/AanvraagDetail.jsx";
import Dashboard from "./pages/Dashboard.jsx";
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
import OnboardingPlan from "./pages/onboarding/OnboardingPlan.jsx";
import OnboardingSuccess from "./pages/onboarding/OnboardingSuccess.jsx";
import BouwkundigOntwerp from "./pages/site/BouwkundigOntwerp.jsx";
import Contact from "./pages/site/Contact.jsx";
import Diensten from "./pages/site/Diensten.jsx";
import Energielabels from "./pages/site/Energielabels.jsx";
import EpaAdvies from "./pages/site/EpaAdvies.jsx";
import Fotografie from "./pages/site/Fotografie.jsx";
import Home from "./pages/site/Home.jsx";
import Meetstaten from "./pages/site/Meetstaten.jsx";
import OverOns from "./pages/site/OverOns.jsx";
import Referenties from "./pages/site/Referenties.jsx";
import Subsidies from "./pages/site/Subsidies.jsx";

export default function App() {
  return (
    <Routes>
      {/*
        Publieke corporate website (AAA-Lex Offices) — nieuwe Navbar +
        Footer. Alles onder SiteLayout gebruikt de nieuwe navigatie.
      */}
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/diensten" element={<Diensten />} />
        <Route path="/diensten/energielabels" element={<Energielabels />} />
        <Route path="/diensten/meetstaten" element={<Meetstaten />} />
        <Route path="/diensten/epa-advies" element={<EpaAdvies />} />
        <Route path="/diensten/subsidies" element={<Subsidies />} />
        <Route path="/diensten/fotografie" element={<Fotografie />} />
        <Route
          path="/diensten/bouwkundig-ontwerp"
          element={<BouwkundigOntwerp />}
        />
        <Route path="/over-ons" element={<OverOns />} />
        <Route path="/referenties" element={<Referenties />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/*
        Portal + auth — ongewijzigd. Gebruikt het bestaande Layout
        (portal navbar/footer) zodat /subsidiecheck, /login, /register,
        /dashboard, /onboarding/* exact hetzelfde blijven.
      */}
      <Route element={<Layout />}>
        <Route path="/subsidiecheck" element={<SubsidieCheck />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/aanvraag/nieuw" element={<NieuweAanvraag />} />
          <Route path="/aanvraag/:id" element={<AanvraagDetail />} />
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
