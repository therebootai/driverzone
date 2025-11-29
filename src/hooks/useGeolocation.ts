import { useCallback, useState } from "react";

interface Coordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

interface UseGeolocationReturn {
  getCoordinates: () => Promise<Coordinates>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCoordinates = useCallback(async (): Promise<Coordinates> => {
    setIsLoading(true);
    setError(null);

    try {
      const coordinates = await new Promise<Coordinates>((resolve, reject) => {
        if (!("geolocation" in navigator)) {
          reject(new Error("Geolocation is not supported by this browser"));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
          },
          (error) => {
            reject(new Error(getErrorMessage(error)));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });

      return coordinates;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Location access denied by user";
      case error.POSITION_UNAVAILABLE:
        return "Location information unavailable";
      case error.TIMEOUT:
        return "Location request timed out";
      default:
        return "An unknown error occurred";
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { getCoordinates, isLoading, error, clearError };
};
