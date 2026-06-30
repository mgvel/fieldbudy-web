import { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";
import { ReportPreviewPayload } from "../types/report";

interface UseReportPreviewResult {
  data: ReportPreviewPayload | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useReportPreview(slug: string | undefined): UseReportPreviewResult {
  const [data, setData] = useState<ReportPreviewPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTick, setRefetchTick] = useState(0);

  useEffect(() => {
    if (!slug) {
      setError("Missing project slug.");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    async function fetchPreview() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<{
          status: string;
          payload: ReportPreviewPayload;
          message?: string;
        }>(`/project/preview-report/${slug}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (cancelled) return; 

        const json = response.data;
        if (json.status !== "success") {
          throw new Error(json.message || "Failed to load report preview.");
        }

        setData(json.payload);
      } catch (err) {
        if (cancelled || controller.signal.aborted) return; // <-- changed

        setError((err as Error).message || "Something went wrong while loading the report.");
      } finally {
        if (!cancelled) setIsLoading(false); // <-- changed
      }
    }

    fetchPreview();

    return () => {
      cancelled = true; 
      controller.abort();
    };
  }, [slug, refetchTick]);

  return {
    data,
    isLoading,
    error,
    refetch: () => setRefetchTick((tick) => tick + 1),
  };
}