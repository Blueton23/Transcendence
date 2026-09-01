import { Routes, Route, Navigate } from "react-router";
import DesignSystem from "../pages/DesignSystem";
import Text from "../shared/ui/Text";
import { AppLayout } from "./AppLayout";
import ModalTestPage from "../pages/ModalTestPage";
import ProfilePage from "../pages/ProfilePage";
import SignupPage from "../pages/SignupPage";
import LoginPage from "../pages/LoginPage";

import AuthTest from "../features/auth/components/AuthTest";

function PlaceHolder({ label }: { label: string }) {
  return <Text className="p-4">{label} à venir</Text>;
}

function App() {
  return (
    <Routes>
      <Route path="/modal" element={<ModalTestPage />} />
      <Route path="/design-system" element={<DesignSystem />} />
      <Route path="/" element={<PlaceHolder label="accueil" />} />
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/signup" element={<SignupPage/>} />
      <Route path="/auth-test" element={<AuthTest />} />
      <Route path="/join/:slug" element={<PlaceHolder label="join" />} />
      <Route element={<AppLayout />}>
        <Route path="/profile" element={<ProfilePage/>} />
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
