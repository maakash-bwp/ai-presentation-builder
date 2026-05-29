import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export const useAuthInit = () => {
  const token = useAuthStore((state) => state.token);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    if (!isInitialized && token) {
      initialize();
      return;
    }
    if (!isInitialized && !token) {
      useAuthStore.setState({ isInitialized: true });
    }
  }, [initialize, isInitialized, token]);
};
