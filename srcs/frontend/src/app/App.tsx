import { Routes, Route, Navigate } from "react-router";

import Text from "@/shared/ui/Text";
import { AppLayout } from "./AppLayout";

import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import GuestRoute from "@/features/auth/components/GuestRoute";

import DesignSystem from "@/pages/DesignSystem";
import ModalDemo from "@/pages/ModalDemo";
import ProfilePage from "@/pages/ProfilePage";
import SignupPage from "@/pages/SignupPage";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import ItineraryPage from "@/pages/ItineraryPage";
import { IdeasPage } from "@/pages/IdeasPage";
import TravelPage from "@/pages/TravelPage";
import JoinPage from "@/pages/JoinPage";
import ChatPage from "@/pages/ChatPage";
import LegalPage from "@/pages/LegalPage";
import { useTranslation } from "react-i18next";

function PlaceHolder({ label }: { label: string }) {
  return <Text className="p-4">{label} à venir</Text>;
}

function App() {
  useTranslation();
  return (
    <Routes>
      <Route path="/modal" element={<ModalDemo />} />
      <Route path="/design-system" element={<DesignSystem />} />
      <Route path="/" element={<HomePage />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      <Route path="/privacy" element={<LegalPage doc="privacy" />} />
      <Route path="/terms" element={<LegalPage doc="terms" />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/join/:token" element={<JoinPage />} />
        <Route element={<AppLayout />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/travel" element={<TravelPage />} />
          <Route path="/travel/:id">
            <Route index element={<Navigate to="itinerary" replace />} />
            <Route path="itinerary" element={<ItineraryPage />} />
            <Route path="ideas" element={<IdeasPage />} />
            <Route path="expenses" element={<PlaceHolder label="expenses" />} />
            <Route path="chat" element={<ChatPage />} />
            <Route
              path="assistant"
              element={<PlaceHolder label="assistant" />}
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
