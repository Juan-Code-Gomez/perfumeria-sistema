import api from "./api";

export interface Category {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        products: number;
    };
}

export interface CategoryStatistics {
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
    categoriesWithProducts: number;
    mostUsedCategories: Array<{
        id: number;
        name: string;
        productCount: number;
    }>;
    recentCategories: Category[];
}

export const createCategory = async (category: { name: string; description?: string }) => {
    const response = await api.post("/categories", category);
    return response.data;
}

export const getCategories = async (params?: { includeInactive?: boolean; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.includeInactive) queryParams.append('includeInactive', 'true');
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await api.get(`/categories?${queryParams.toString()}`);
    // El backend devuelve { success: true, data: categories[] }
    return response.data.success ? response.data.data : response.data;
}

export const getCategoryStatistics = async (): Promise<CategoryStatistics> => {
    const response = await api.get("/categories/statistics");
    // El backend devuelve { success: true, data: statistics }
    return response.data.success ? response.data.data : response.data;
}

export const getCategoryById = async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
}

export const updateCategory = async (category: { id: number; name: string; description?: string }) => {
    const response = await api.put(`/categories/${category.id}`, { 
        name: category.name,
        description: category.description 
    });
    return response.data;
}

export const deleteCategory = async (id: number) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
}

export const toggleCategoryStatus = async (id: number) => {
    const response = await api.put(`/categories/${id}/toggle-status`);
    return response.data;
} 