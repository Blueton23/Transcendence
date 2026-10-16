from typing import ClassVar

from rest_framework.authentication import SessionAuthentication, TokenAuthentication


class PublicApiMixin:
    authentication_classes: ClassVar[list] = [
        SessionAuthentication,
        TokenAuthentication,
    ]
