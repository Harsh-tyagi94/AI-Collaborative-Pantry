import api from "@/lib/axios";

export const createRoomApi = async (roomName: string) => {
  const response = await api.post("/rooms/create", { roomName });
  return response.data;
};

export const joiningRoomApi = async (roomId: string) => {
  const response = await api.post(`/rooms/${roomId}/join`);
  return response.data;
};

export const addIngredientApi = async (
  roomId: string,
  ingredient: string
) => {
  const response = await api.post(`/rooms/${roomId}/add-ingredient`, {
    ingredient,
  });

  return response.data;
};

export const getIngredientsApi = async (roomId: string) => {
  const response = await api.get(`/rooms/${roomId}/get-ingredients`);
  return response.data;
};

export const removeIngredientApi = async (
  roomId: string,
  ingredient: string
) => {
  const response = await api.delete(`/rooms/${roomId}/remove-ingredient`, {
    data: { ingredient },
  });

  return response.data;
};

export const getRoomHistoryApi = async () => {
  const response = await api.get("/rooms/gethistory");
  return response.data;
};

export const getRoomStateApi = async (roomId: string) => {
  const response = await api.get(`/rooms/${roomId}/roomstate`);
  return response.data;
};

export const deleteRoomApi = async (roomId: string) => {
  const response = await api.delete(`/rooms/${roomId}`);
  return response.data;
};
