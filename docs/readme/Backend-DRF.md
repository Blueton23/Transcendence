# Backend — fiche vues et serializers (DRF)

Rappel de ce que fait chaque morceau quand on écrit une API avec Django REST Framework, avec des exemples tirés du projet.

## Vues

### Les vues toutes faites de DRF

On choisit la classe selon les actions dont l'URL a besoin.

| Classe | Actions |
|---|---|
| `ListCreateAPIView` | lister (`GET`) + créer (`POST`) |
| `RetrieveUpdateAPIView` | lire un seul (`GET`) + modifier (`PATCH`/`PUT`) |
| `RetrieveUpdateDestroyAPIView` | lire un seul + modifier + supprimer (`DELETE`) |
| `GenericAPIView` | rien d'automatique, on écrit `get()`/`post()` soi-même |

La création se fait sur la vue **liste** (`POST /travels/5/steps/`) : on crée une ressource *dans* la collection. La vue **détail** n'agit que sur un objet qui existe déjà.

### Ce qu'on écrit dans une vue toute faite

1. `queryset` : la table de départ, avant filtrage.
2. `serializer_class` : quel serializer utiliser.
3. `permission_classes` : qui a le droit. Par défaut, `IsAuthenticated` (réglage global dans `config/settings.py`). Déclarer `permission_classes` dans une vue **remplace** ce réglage, il faut donc relister `IsAuthenticated` si on ajoute une autre permission.
4. `get_queryset()` si on doit filtrer, par exemple par le `travel_id` lu dans l'URL (`self.kwargs["travel_id"]`).
5. `perform_create()` / `perform_update()` / `perform_destroy()` si on doit changer le moment de l'enregistrement.

```python
class StepListView(ListCreateAPIView):
    queryset = Step.objects.alive()
    serializer_class = StepSerializer
    permission_classes = [IsAuthenticated, IsTravelParticipant]

    def get_queryset(self):
        return super().get_queryset().filter(travel_id=self.kwargs["travel_id"])

    def perform_create(self, serializer):
        # le travel_id vient de l'URL, jamais du JSON envoyé par le client
        serializer.save(travel_id=self.kwargs["travel_id"])
```

### Ce que DRF fait en interne

Chaque vue toute faite utilise le serializer, sauf la suppression.

| Action | Méthode DRF | Ce qu'elle fait |
|---|---|---|
| Lister | `list` | `get_serializer(queryset, many=True)` → JSON |
| Créer | `create` | `get_serializer(data=request.data)` → `is_valid()` → `perform_create()` → `serializer.save()` |
| Lire | `retrieve` | `get_serializer(instance)` → JSON |
| Modifier | `update` | `get_serializer(instance, data=request.data, partial=...)` → `is_valid()` → `perform_update()` → `serializer.save()` |
| Supprimer | `destroy` | pas de serializer : `perform_destroy()` → `instance.delete()` |

`self.get_serializer(...)` revient à `serializer_class(...)`, mais transmet en plus le `context` (la requête et la vue). C'est grâce à lui qu'un serializer peut lire `self.context["view"].kwargs`.

### Action qui n'est ni créer, ni lire, ni modifier, ni supprimer

Exemple : choisir un hébergement (`IdeaChoiceView`). Aucune classe toute faite ne la gère, donc on part de `GenericAPIView` et on recopie le même schéma que DRF :

```python
serializer = self.get_serializer(idea, data={}, partial=True)
serializer.is_valid(raise_exception=True)
serializer.save(chosen_by=request.user, chosen_at=timezone.now())
return Response(serializer.data, status=status.HTTP_200_OK)
```

- `data={}` : le client n'envoie rien, les valeurs viennent du serveur.
- `partial=True` : on ne remplit pas toute la fiche (sinon `title`, `type`… seraient exigés).
- `is_valid()` : obligatoire avant `save()`, même avec des données vides.
- `save(...)` : on passe les valeurs décidées par le serveur.

**Règle : toute écriture en base depuis une vue passe par le serializer, jamais par `objet.save()` directement.** Sinon, une règle du modèle qui échoue remonte comme une erreur Django que DRF ne connaît pas, et le client reçoit un 500 au lieu d'un 400.

### Verrou en cas de clics simultanés

`select_for_update()` verrouille des lignes en base le temps d'une transaction (`@transaction.atomic`). Si deux personnes choisissent en même temps deux hébergements pour les mêmes nuits, la deuxième requête attend la fin de la première, puis voit son choix et est refusée. On verrouille la ligne que les deux requêtes ont en commun (ici l'étape).

## Serializers

Un serializer **valide** ce qui entre et **transforme en JSON** ce qui sort. Il ne valide pas ce qui sort.

### Les éléments

1. **`Meta.model` + `Meta.fields`** : les champs qui circulent, dans les deux sens. Pour chaque champ qui existe dans le modèle (`title`, `start_date`…), `ModelSerializer` crée tout seul le champ correspondant, avec son type et les règles du modèle (longueur maximale, validateurs, champ obligatoire…).
2. **`Meta.read_only_fields`** (ou `read_only=True` sur un champ) : visibles en sortie, impossibles à envoyer par le client (`id`, `created_at`, `travel_id`…).
3. **Champs déclarés au-dessus de `Meta`** : seulement quand le champ automatique ne convient pas.
4. **`validate()`** : les règles propres à la requête. S'exécute pendant `is_valid()`, avant toute écriture.
5. **`save()` avec `try/except`** : seulement si le modèle a des règles dans `clean()` qu'il vérifie lui-même à l'enregistrement.

### `SerializerMethodField`

Un champ qui n'existe pas tel quel dans le modèle, calculé au moment d'envoyer la réponse par une méthode `get_<nom>(self, obj)`. Toujours en lecture seule.

| Champ (`TravelSerializer`) | Dans le modèle ? | Pourquoi |
|---|---|---|
| `nights` | non | **calculé** : `(end_date - start_date).days` |
| `travelers` | non | **cherché ailleurs** : vient de la table `Participation` |
| `status` | oui, stocké `"c"`/`"f"` | **reformaté** : envoyé en `"current"`/`"finished"` |

`title` n'en a pas besoin : il existe dans le modèle et s'envoie tel quel. On garde le champ automatique tant que la valeur du modèle convient telle quelle.

### `validate()` ou `try/except` dans `save()` ?

| | `validate()` | `try/except` dans `save()` |
|---|---|---|
| Quand ça s'exécute | pendant `is_valid()`, **avant** d'écrire | pendant l'écriture |
| Erreur Django levée dedans | convertie en 400 **automatiquement** par DRF | **pas** convertie : il faut le `try/except` |
| À utiliser quand | la règle dépend de la requête (URL, deux champs à comparer, un autre objet), **ou** le modèle n'appelle pas `clean()` en enregistrant | les règles sont dans `clean()` **et** le modèle appelle `full_clean()` à chaque `save()` |
| Exemple | `StepSerializer` | `IdeaSerializer` |

Pour choisir, regarder d'abord le modèle :

- il hérite de `ValidatedModel` (`common/models.py`) → son `save()` appelle `full_clean()`, donc `clean()`. Le `try/except` dans `save()` suffit à traduire ses erreurs en 400.
- il n'en hérite pas (comme `Step`) → `clean()` ne s'exécute que dans l'admin Django. Les règles doivent être dans `validate()`, sinon l'API ne les vérifie jamais.

```python
# IdeaSerializer : les règles sont dans Idea.clean(), on traduit l'erreur
def save(self, **kwargs):
    try:
        return super().save(**kwargs)
    except DjangoValidationError as e:
        raise serializers.ValidationError(e.message_dict) from e
```

```python
# StepSerializer : la règle a besoin du voyage, lu dans l'URL
def validate(self, attrs):
    if self.instance:
        travel = self.instance.travel
    else:
        travel_id = self.context["view"].kwargs["travel_id"]
        travel = get_object_or_404(Travel, pk=travel_id)
    validate_date_within_travel(travel, self.instance, attrs)
    return attrs
```

`TimeStampedModel` et `ValidatedModel` sont deux briques indépendantes : la première ajoute `created_at`/`updated_at`, la seconde fait appeler `full_clean()` par `save()`. Un modèle peut hériter des deux (`Idea`).
