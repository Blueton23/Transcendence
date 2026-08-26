from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView


class IsSelf(BasePermission):
    """Grants access only when the object IS the requesting user."""

    def has_object_permission(
        self, request: Request, view: APIView, obj: object
    ) -> bool:
        return obj == request.user


class IsOwner(BasePermission):
    """Grants access only when `obj.<owner_field>` is the requesting user.

    Set `owner_field` on the view (or subclass this) if the owning
    attribute isn't named "user".
    """

    owner_field = "user"

    def has_object_permission(
        self, request: Request, view: APIView, obj: object
    ) -> bool:
        owner_field = getattr(view, "owner_field", self.owner_field)
        return getattr(obj, owner_field, None) == request.user
