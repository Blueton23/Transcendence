import { Routes, Route, Navigate } from "react-router";

import Text from "../shared/ui/Text";
import { AppLayout } from "./AppLayout";

import ProtectedRoute from "../features/auth/components/ProtectedRoute";

import DesignSystem from "../pages/DesignSystem";
import ModalDemo from "../pages/ModalDemo";
import ProfilePage from "../pages/ProfilePage";
import SignupPage from "../pages/SignupPage";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import ItineraryPage from "../pages/ItineraryPage";
import { IdeasPage } from "@/pages/IdeasPage";
import TravelPage from "@/pages/TravelPage";
import JoinPage from "@/pages/JoinPage";
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
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/privacy" element={<PlaceHolder label="privacy a venir" />} />
      <Route path="/terms" element={<PlaceHolder label="terms a venir" />} />
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
            <Route path="chat" element={<PlaceHolder label="chat" />} />
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
