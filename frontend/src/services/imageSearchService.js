import api from "./api";

export const searchStockImages = async (query, perPage = 8) => {
  const { data } = await api.get("/images/search", {
    params: {
      query,
      per_page: perPage
    }
  });

  return {
    provider: data?.data?.provider || "none",
    images: data?.data?.images || []
  };
};
