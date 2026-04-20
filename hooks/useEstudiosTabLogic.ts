"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStudyDefaults,
  createStudySchema,
  studyTypeLabels,
  type Study,
  type StudyType,
} from "@/lib/schemas/studies-schema";

interface UploadFormData {
  type: StudyType;
  study_date: string;
  file: File | null;
}

interface UploadFormErrors {
  type?: string;
  study_date?: string;
  file?: string;
}

interface UseEstudiosTabLogicParams {
  patientId: string;
}

function getTodayDateInputValue() {
  return new Date().toISOString().split("T")[0];
}

async function fetchStudies(patientId: string): Promise<Study[]> {
  const response = await fetch(`/api/patients/${patientId}/studies`);

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "Error al obtener estudios");
  }

  return response.json();
}

async function uploadStudy(patientId: string, formData: UploadFormData): Promise<Study> {
  const multipart = new FormData();
  multipart.append("type", formData.type);
  multipart.append("study_date", formData.study_date);

  if (!formData.file) {
    throw new Error("Debe seleccionar un archivo");
  }

  multipart.append("file", formData.file);

  const response = await fetch(`/api/patients/${patientId}/studies`, {
    method: "POST",
    body: multipart,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "Error al subir estudio");
  }

  return response.json();
}

export function useEstudiosTabLogic({ patientId }: UseEstudiosTabLogicParams) {
  const queryClient = useQueryClient();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewerDialogOpen, setIsViewerDialogOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [errors, setErrors] = useState<UploadFormErrors>({});
  const [formData, setFormData] = useState<UploadFormData>({
    ...createStudyDefaults,
    study_date: getTodayDateInputValue(),
    file: null,
  });

  const studiesQuery = useQuery({
    queryKey: ["studies", patientId],
    queryFn: () => fetchStudies(patientId),
    enabled: Boolean(patientId),
    staleTime: 1000 * 60 * 5,
  });

  const uploadMutation = useMutation({
    mutationFn: (values: UploadFormData) => uploadStudy(patientId, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["studies", patientId] });
      setFormData({
        ...createStudyDefaults,
        study_date: getTodayDateInputValue(),
        file: null,
      });
      setErrors({});
      setIsUploadDialogOpen(false);
    },
  });

  const validate = useCallback(() => {
    const result = createStudySchema.safeParse({
      type: formData.type,
      study_date: formData.study_date,
      file: formData.file,
    });

    if (result.success) {
      setErrors({});
      return true;
    }

    const nextErrors: UploadFormErrors = {};
    result.error.issues.forEach((issue) => {
      const key = issue.path[0];
      if (typeof key === "string" && !nextErrors[key as keyof UploadFormErrors]) {
        nextErrors[key as keyof UploadFormErrors] = issue.message;
      }
    });

    setErrors(nextErrors);
    return false;
  }, [formData]);

  const handleUploadSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (!validate()) {
        return;
      }

      uploadMutation.mutate(formData);
    },
    [formData, uploadMutation, validate]
  );

  const openUploadDialog = useCallback(() => {
    setErrors({});
    uploadMutation.reset();
    setIsUploadDialogOpen(true);
  }, [uploadMutation]);

  const closeUploadDialog = useCallback(() => {
    setIsUploadDialogOpen(false);
    setErrors({});
    uploadMutation.reset();
  }, [uploadMutation]);

  const setStudyType = useCallback((type: StudyType) => {
    setFormData((prev) => ({ ...prev, type }));
    setErrors((prev) => ({ ...prev, type: undefined }));
  }, []);

  const setStudyDate = useCallback((study_date: string) => {
    setFormData((prev) => ({ ...prev, study_date }));
    setErrors((prev) => ({ ...prev, study_date: undefined }));
  }, []);

  const setStudyFile = useCallback((file: File | null) => {
    setFormData((prev) => ({ ...prev, file }));
    setErrors((prev) => ({ ...prev, file: undefined }));
  }, []);

  const openImageViewer = useCallback((study: Study) => {
    setSelectedStudy(study);
    setIsViewerDialogOpen(true);
  }, []);

  const closeImageViewer = useCallback(() => {
    setIsViewerDialogOpen(false);
    setSelectedStudy(null);
  }, []);

  const studyTypeOptions = useMemo(
    () =>
      Object.entries(studyTypeLabels).map(([value, label]) => ({
        value: value as StudyType,
        label,
      })),
    []
  );

  return {
    data: {
      studies: studiesQuery.data ?? [],
      selectedStudy,
      formData,
      errors,
      studyTypeOptions,
      todayDate: getTodayDateInputValue(),
    },
    states: {
      isLoading: studiesQuery.isLoading,
      isFetching: studiesQuery.isFetching,
      isError: studiesQuery.isError,
      studiesError: studiesQuery.error,
      isUploading: uploadMutation.isPending,
      uploadError: uploadMutation.error,
      isUploadDialogOpen,
      isViewerDialogOpen,
    },
    methods: {
      openUploadDialog,
      closeUploadDialog,
      setStudyType,
      setStudyDate,
      setStudyFile,
      handleUploadSubmit,
      openImageViewer,
      closeImageViewer,
    },
  };
}
