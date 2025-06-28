import api from "./api";

export const createCategory = async (category: { name: string }) => {
    const response = await api.post("/categories", category);
    return response.data;
}

export const getCategories = async () => {
    const response = await api.get("/categories");
    return response.data;
}

export const updateCategory = async (category: { id: number, name: string }) => {
    const response = await api.put(`/categories/${category.id}`, { name: category.name });
    return response.data;
}

export const deleteCategory = async (id: number) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
} 