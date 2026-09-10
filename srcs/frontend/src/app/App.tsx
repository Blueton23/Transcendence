import { Routes, Route, Navigate } from "react-router";

import Text from "../shared/ui/Text";
import { AppLayout } from "./AppLayout";

import ProtectedRoute from "../features/auth/components/ProtectedRoute";

import DesignSystem from "../pages/DesignSystem";
import ModalDemo from "../pages/ModalDemo";

function PlaceHolder({ label }: { label: string }) {
  return <Text className="p-4">{label} à venir</Text>;
}

function App() {
  return (
    <Routes>
      <Route path="/modal" element={<ModalDemo />} />
      <Route path="/design-system" element={<DesignSystem />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/join/:slug" element={<PlaceHolder label="join" />} />
      <Route element={<AppLayout />}>
        <Route path="/profil" element={<PlaceHolder label="profile" />} />
        <Route path="/trip" element={<PlaceHolder label="trip" />} />
        <Route path="/trip/:id">
          <Route index element={<Navigate to="itinerary" replace />} />
          <Route path="itinerary" element={<PlaceHolder label="itinerary" />} />
          <Route path="ideas" element={<PlaceHolder label="ideas" />} />
          <Route path="expenses" element={<PlaceHolder label="expenses" />} />
          <Route path="chat" element={<PlaceHolder label="chat" />} />
          <Route path="assistant" element={<PlaceHolder label="assistant" />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
