import Heading from "@/shared/ui/Heading";
import Text from "@/shared/ui/Text";
import Avatar from "@/shared/ui/Avatar";

import { useAuth } from "../../auth/context/useAuth";
import type { User } from "../../auth/types";

interface ProfileInfoProps {
  user?: User;
}

function ProfileInfo({ user }: ProfileInfoProps) {
  const { currentUser } = useAuth();
  const profileUser = user ?? currentUser;

  if (!profileUser) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center">
        <div className="flex w-25 justify-center">
          <Avatar user={profileUser} size="xl" />
        </div>

        <div>
          <Heading level={3} size="lg">
            {profileUser.firstName} {profileUser.lastName}
          </Heading>

          <Text tone="secondary" size="md" font="mono">
            {profileUser.username}
          </Text>

          <Text tone="primary" size="md">
            {profileUser.email}
          </Text>
        </div>
      </div>
    </div>
  );
}

export default ProfileInfo;
