import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { repositoryService } from "../services/repository.service.js";
import { CreateRepositoryPayload, UpdateRepositoryPayload } from "../types/repository.types.js";

export const REPOSITORIES_QUERY_KEY = ["repositories"];
export const repositoryDetailQueryKey = (id: string) => ["repository", id];
export const repositoryMembersQueryKey = (id: string) => ["repository", id, "members"];

export const useRepositoriesList = () => {
  return useQuery({
    queryKey: REPOSITORIES_QUERY_KEY,
    queryFn: () => repositoryService.list(),
  });
};

export const useRepositoryDetail = (id: string) => {
  return useQuery({
    queryKey: repositoryDetailQueryKey(id),
    queryFn: () => repositoryService.getById(id),
    enabled: Boolean(id),
  });
};

export const useCreateRepository = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRepositoryPayload) => repositoryService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPOSITORIES_QUERY_KEY });
    },
  });
};

export const useUpdateRepository = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRepositoryPayload) => repositoryService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPOSITORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: repositoryDetailQueryKey(id) });
    },
  });
};

export const useDeleteRepository = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repositoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPOSITORIES_QUERY_KEY });
    },
  });
};

export const useRepositoryMembers = (id: string) => {
  return useQuery({
    queryKey: repositoryMembersQueryKey(id),
    queryFn: () => repositoryService.getMembers(id),
    enabled: Boolean(id),
  });
};

export const repositoryLanguagesQueryKey = (id: string) => ["repository", id, "languages"];

export const useRepositoryLanguages = (id: string) => {
  return useQuery({
    queryKey: repositoryLanguagesQueryKey(id),
    queryFn: () => repositoryService.getLanguages(id),
    enabled: Boolean(id),
  });
};
