import { useState } from "react";

import Button from "../../../shared/ui/Button";
import Heading from "../../../shared/ui/Heading";
import Text from "../../../shared/ui/Text";
import Avatar from "../../../shared/ui/Avatar";
import ProfileModifier from "./ProfileModifier"


function ProfileInfo() {
    const [isModifierOpen, setIsModifierOpen] = useState(false);

    return(
    <>
    <div>
        <div className="flex items-center">
            <div className="flex w-24 justify-center">
                <Avatar size="lg" color="1" children={undefined}>
                    JS
                </Avatar>
            </div>
            <div>
                <Heading level={3} size="lg" children={undefined}>
                    John Smith
                </Heading>
                <Text tone="secondary" size="md" font="mono" children={undefined}>
                    PseudoJS
                </Text>
                <Text tone="primary" size="md" children={undefined}>
                    JohnSmith@yahoo.fr
                </Text>
            </div>
            <div className="ml-auto">
            <Button variant="primary" className="mt-4" children={undefined} onClick={() => setIsModifierOpen(true)} >
                Modifier le profil
            </Button>
            </div>
        </div>
    </div>
    {isModifierOpen && (<ProfileModifier onClose={() => setIsModifierOpen(false)}/>)}
    </>

    );
}

export default ProfileInfo;


/*
function ProfileInfo() {
    const [isModifierOpen, setIsModifierOpen] = useState(false);
  
    return (
      <>
        <div>
          <div className="flex items-center">
            <div className="flex w-24 items-center justify-center">
              <Avatar size="lg" color="1">
                JS
              </Avatar>
            </div>
  
            <div>
              <Heading level={3} size="lg">
                John Smith
              </Heading>
  
              <Text tone="secondary" size="md" font="mono">
                PseudoJS
              </Text>
  
              <Text tone="primary" size="md">
                JohnSmith@yahoo.fr
              </Text>
            </div>
  
            <div className="ml-auto">
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => setIsModifierOpen(true)}
              >
                Modifier le profil
              </Button>
            </div>
          </div>
        </div>
  
        {isModifierOpen && (
          <ProfileModifier
            onClose={() => setIsModifierOpen(false)}
          />
        )}
      </>
    );
  }
  
  export default ProfileInfo;

  */