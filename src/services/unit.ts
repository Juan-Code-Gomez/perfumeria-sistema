import api from "./api";

export const createUnit = async (unit: { name: string }) => {
    const response = await api.post("/units", unit);
    return response.data;
}

export const getUnits = async () => {
    const response = await api.get("/units");
    return response.data;
}

export const updateUnit = async (unit: { id: number, name: string }) => {
    const response = await api.put(`/units/${unit.id}`, { name: unit.name });
    return response.data;
}

export const deleteUnit = async (id: number) => {
    const response = await api.delete(`/units/${id}`);
    return response.data;
}