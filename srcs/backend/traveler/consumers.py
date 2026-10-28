from common.consumers import GroupEventConsumer
from common.realtime import user_group


class NotificationConsumer(GroupEventConsumer):
    """Personal channel of the logged-in traveler: joins `user_<id>` and
    forwards what concerns them outside of any travel page (friend requests
    for now). Every tab of the same user shares the group."""

    async def get_group_name(self):
        return user_group(self.scope["user"].id)
