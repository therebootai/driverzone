"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useDebounceCallback } from "./useDebounce";

export const useQueryParamsAdvanced = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && value.trim() !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const updateFiltersDebounced = useDebounceCallback(updateFilters, 500);

  const getParam = useCallback(
    (key: string) => {
      return searchParams.get(key);
    },
    [searchParams]
  );

  const getAllParams = useCallback(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  const clearAllParams = useCallback(() => {
    router.push("?", { scroll: false });
  }, [router]);

  return {
    updateFilters,
    updateFiltersDebounced,
    getParam,
    getAllParams,
    clearAllParams,
    searchParams,
  };
};
