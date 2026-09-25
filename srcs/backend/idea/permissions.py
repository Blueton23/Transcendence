from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsIdeaOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.traveler == request.user
