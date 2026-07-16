import api from "./api";

export const createEmergencyRequest = async (data: {
  emergencyType: string;
  notes: string;
  location: {
     label: string;
    latitude: number;
    longitude: number;
  };
}) => {
  const response = await api.post("/emergency", data);
  return response.data;
};

export const getMyEmergencyRequests = async () => {
  const response = await api.get("/emergency/my-requests");
  return response.data;
};

export const getEmergencyRequestById = async (id: string) => {
  const response = await api.get(`/emergency/${id}`);
  return response.data;
};

export const updateEmergencyStatus = async (
  id: string,
  status: string
) => {
  const response = await api.patch(`/emergency/${id}/status`, {
    status,
  });

  return response.data;
};

export const getEmergencyLocation = async (id: string) => {
  const response = await api.get(`/emergency/${id}/location`);
  return response.data;
};

export const selectHospital = async (
  emergencyId: string,
  hospitalId: string
) => {
  const response = await api.patch(
    `/emergency/${emergencyId}/hospital`,
    {
      hospitalId,
    }
  );

  return response.data;
};