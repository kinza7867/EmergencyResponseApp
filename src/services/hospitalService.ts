import api from "./api";

export const getNearbyHospitals = async (
  latitude: number,
  longitude: number
) => {
  const response = await api.get(
    `/hospitals?lat=${latitude}&lng=${longitude}`
  );

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