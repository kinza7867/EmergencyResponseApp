import api from "./api";

export const getEmergencyContacts = async () => {
  const response = await api.get("/emergency-contacts");
  return response.data;
};

export const addEmergencyContact = async (data: {
  name: string;
  phone: string;
  relationship: string;
}) => {
  const response = await api.post("/emergency-contacts", data);
  return response.data;
};

export const updateEmergencyContact = async (
  id: string,
  data: {
    name: string;
    phone: string;
    relationship: string;
  }
) => {
  const response = await api.put(`/emergency-contacts/${id}`, data);
  return response.data;
};

export const deleteEmergencyContact = async (id: string) => {
  const response = await api.delete(`/emergency-contacts/${id}`);
  return response.data;
};

export const notifyEmergencyContacts = async (emergencyId: string) => {
  const response = await api.post(`/emergency/${emergencyId}/notify`);
  return response.data;
};