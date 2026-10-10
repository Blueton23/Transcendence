import type {
  IdeaApiType,
  IdeaApiStatus,
  IdeaType,
  IdeaStatus,
  IdeaApiResponse,
  Idea,
  CreateIdeaApiInput,
  CreateIdeaInput,
} from "@/features/idea/types";

// Conversion pour lecture backend/frontend
const ideaTypeMap: Record<IdeaApiType, IdeaType> = {
  r: "restaurant",
  l: "accommodation",
  a: "activity",
  s: "sightseeing",
};

const ideaStatusMap: Record<IdeaApiStatus, IdeaStatus> = {
  s: "suggested",
  p: "placed",
  c: "chosen",
};

// Conversion pour lecture frontend/backend
const ideaTypeToApiMap: Record<IdeaType, IdeaApiType> = {
  restaurant: "r",
  accommodation: "l",
  activity: "a",
  sightseeing: "s",
};

// Retourne une idée de l’API et utilisable par les composants
export function mapIdeaFromApi(response: IdeaApiResponse): Idea {
  const isAccommodation = response.type === "l";

  return {
    id: response.id,
    travelId: response.travelId,
    travelerId: response.travelerId,
    stepId: response.stepId,
    chosenBy: response.chosenById,
    title: response.title,
    type: ideaTypeMap[response.type],
    status: ideaStatusMap[response.status],
    voteCount: response.voteCount,
    voted: response.voted,
    localisation: response.localisation,
    note: response.note,
    url: response.url,
    latitude: response.latitude === null ? null : Number(response.latitude),
    longitude: response.longitude === null ? null : Number(response.longitude),
    pricePerNight:
      response.pricePerNight === null ? null : Number(response.pricePerNight),
    date: isAccommodation ? null : response.startDate,
    arrivalDate: isAccommodation ? response.startDate : null,
    departureDate: isAccommodation ? response.endDate : null,
    chosenAt: response.chosenAt,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  };
}

// Retourne une idée créer de l'API
export function mapCreateIdeaToApi(input: CreateIdeaInput): CreateIdeaApiInput {
  const isAccommodation = input.type === "accommodation";

  return {
    title: input.title,
    type: ideaTypeToApiMap[input.type],
    stepId: input.stepId,
    localisation: input.localisation ?? "",
    note: input.note ?? "",
    url: input.url ?? "",
    latitude: input.latitude,
    longitude: input.longitude,
    pricePerNight: input.pricePerNight,
    startDate: isAccommodation ? input.arrivalDate : input.date,
    endDate: isAccommodation ? input.departureDate : input.date,
  };
}
