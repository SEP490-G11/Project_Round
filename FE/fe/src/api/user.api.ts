import axiosClient from "./axios";

export interface UserBrief {
  id: number;
  email: string;
  fullName: string;
}

export const UserApi = {
  list: () =>
    axiosClient.get<UserBrief[]>("/api/v1/users"),
};
