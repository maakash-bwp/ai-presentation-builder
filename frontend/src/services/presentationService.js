import api from "./api";

export const getPresentationsRequest = async () => {
  const { data } = await api.get("/presentations");
  return data.data;
};

export const getPresentationByIdRequest = async (id) => {
  const { data } = await api.get(`/presentations/${id}`);
  return data.data;
};

export const createPresentationRequest = async (payload) => {
  const { data } = await api.post("/presentations", payload);
  return data.data;
};

export const updatePresentationRequest = async (id, payload) => {
  const { data } = await api.put(`/presentations/${id}`, payload);
  return data.data;
};

export const duplicatePresentationRequest = async (id) => {
  const { data } = await api.post(`/presentations/${id}/duplicate`);
  return data.data;
};

export const deletePresentationRequest = async (id) => {
  await api.delete(`/presentations/${id}`);
};
