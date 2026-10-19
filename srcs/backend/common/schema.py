def public_endpoints_only(endpoints: list[tuple], **kwargs: object) -> list[tuple]:
    """Hook drf-spectacular : ne garde dans la doc que les vues de l'API publique.

    Une vue est publique si elle déclare `public_api = True`
    (automatique avec PublicApiMixin).
    Utiliser dans settings.
    """
    return [
        (path, path_regex, method, callback)
        for path, path_regex, method, callback in endpoints
        if getattr(callback.cls, "public_api", False)
    ]
