from typing import Any

from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def custom_exception_handler(exc: Exception, context: dict) -> Response | None:
    """Reshape DRF's error responses into a consistent envelope.

    {"status": 404, "code": "not_found", "message": "...", "details": null}

    `details` carries per-field validation errors when present (e.g. from
    serializer validation), otherwise it stays null.
    """
    response = drf_exception_handler(exc, context)
    if response is None:
        return None

    code = _extract_code(exc)
    message, details = _extract_message_and_details(response.data)

    response.data = {
        "status": response.status_code,
        "code": code,
        "message": message,
        "details": details,
    }
    return response


def _extract_code(exc: Exception) -> str:
    detail = getattr(exc, "detail", None)

    if isinstance(detail, dict) and "code" in detail:
        code = detail["code"]
        if isinstance(code, (list, tuple)):
            code = code[0] if code else "error"
        return str(code)
    if not hasattr(exc, "get_codes"):
        return "error"
    codes = exc.get_codes()
    if isinstance(codes, dict):
        return "validation_error"
    if isinstance(codes, list):
        return str(codes[0]) if codes else "error"
    return str(codes)


def _extract_message_and_details(data: Any) -> tuple[str, Any]:
    if isinstance(data, dict) and "code" in data and "errors" in data:
        error_code = data["code"]

        # DRF peut encapsuler le code dans une liste d'ErrorDetail.
        if isinstance(error_code, (list, tuple)):
            error_code = error_code[0] if error_code else ""

        if str(error_code) == "password_validation_failed":
            error_codes = data["errors"]

            if not isinstance(error_codes, (list, tuple)):
                error_codes = [error_codes]

            return "Validation failed", {"codes": [str(code) for code in error_codes]}

    if isinstance(data, dict) and "detail" in data and len(data) == 1:
        return str(data["detail"]), None

    return "Validation failed", data
