import { useState } from "react";

import Button from "../../../shared/ui/Button";
import Heading from "../../../shared/ui/Heading";
import Text from "../../../shared/ui/Text";
import Avatar from "../../../shared/ui/Avatar";
import ProfileModify from "./ProfileModify"

import { useAuth } from "../../auth/context/AuthContext";
import { useNavigate } from "react-router";


function ProfileInfo() {
    const [isModifierOpen, setIsModifierOpen] = useState(false);
    const {currentUser} = useAuth();
    const navigate = useNavigate();
    const { logout } = useAuth();

    console.log("SDU curent :", currentUser)

    async function handleLogout() {
        try {
          await logout();
          navigate("/signup", { replace: true });
        } catch (error) {
          console.error("Erreur lors de la déconnexion :", error);
        }
      }

    return(
    <>
    <div>
        <div className="flex items-center">
            <div className="flex w-24 justify-center">
                <Avatar size="lg" color="1">
                    {currentUser.first_name?.charAt(0).toUpperCase()}
                    {currentUser.last_name?.charAt(0).toUpperCase()}
                </Avatar>
            </div>
            <div>
                <Heading level={3} size="lg">
                    {currentUser.first_name} {currentUser.last_name}
                </Heading>
                <Text tone="secondary" size="md" font="mono">
                    {currentUser.username}
                </Text>
                <Text tone="primary" size="md">
                    {currentUser.email}
                </Text>
            </div>
            <div className="ml-auto">
            <Button variant="primary" className="mt-4" onClick={() => setIsModifierOpen(true)} >
                Modifier le profil
            </Button>
            <Button
            variant="outline"
            onClick={handleLogout}
            >
                Se déconnecter
            </Button>
            </div>
        </div>
    </div>
    {isModifierOpen && (<ProfileModify onClose={() => setIsModifierOpen(false)}/>)}
    </>

    );
}

export default ProfileInfo;
