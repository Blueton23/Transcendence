import { Routes, Route, Navigate } from "react-router";
import DesignSystem from "../pages/DesignSystem";
import Text from "../shared/ui/Text";
import { AppLayout } from "./AppLayout";
import ModalDemo from "../pages/ModalDemo";
import { IdeasPage } from "../pages/IdeasPage";

function PlaceHolder({ label }: { label: string }) {
  return <Text className="p-4">{label} à venir</Text>;
}

function App() {
  return (
    <Routes>
      <Route path="/modal" element={<ModalDemo />} />
      <Route path="/design-system" element={<DesignSystem />} />
      <Route path="/" element={<PlaceHolder label="accueil" />} />
      <Route path="/login" element={<PlaceHolder label="login" />} />
      <Route path="/signup" element={<PlaceHolder label="signup" />} />
      <Route path="/join/:slug" element={<PlaceHolder label="join" />} />
      <Route element={<AppLayout />}>
        <Route path="/profil" element={<PlaceHolder label="profile" />} />
        <Route path="/trip" element={<PlaceHolder label="trip" />} />
        <Route path="/trip/:id">
          <Route index element={<Navigate to="itinerary" replace />} />
          <Route path="itinerary" element={<PlaceHolder label="itinerary" />} />
          <Route path="ideas" element={<IdeasPage />} />
          <Route path="expenses" element={<PlaceHolder label="expenses" />} />
          <Route path="chat" element={<PlaceHolder label="chat" />} />
          <Route path="assistant" element={<PlaceHolder label="assistant" />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
