import Heading from "../../../shared/ui/Heading";
import Text from "../../../shared/ui/Text";
import Avatar from "../../../shared/ui/Avatar";

import { useAuth } from "../../auth/context/useAuth";

function ProfileInfo() {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return null;
  }

  return (
    <>
      <div>
        <div className="flex items-center">
          <div className="flex w-24 justify-center">
            <Avatar size="lg" color="1">
              {currentUser.firstName?.charAt(0).toUpperCase()}
              {currentUser.lastName?.charAt(0).toUpperCase()}
            </Avatar>
          </div>
          <div>
            <Heading level={3} size="lg">
              {currentUser.firstName} {currentUser.lastName}
            </Heading>
            <Text tone="secondary" size="md" font="mono">
              {currentUser.username}
            </Text>
            <Text tone="primary" size="md">
              {currentUser.email}
            </Text>
          </div>
        </div>
      </div>
    </>
  );
}
export default ProfileInfo;
