import api from "./api";

export interface Unit {
    id: number;
    name: string;
    symbol?: string;
    description?: string;
    unitType?: string;
    isActive: boolean;
    isDecimal: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        products: number;
    };
}

export interface UnitStatistics {
    totalUnits: number;
    activeUnits: number;
    inactiveUnits: number;
    unitsWithProducts: number;
    unitsByType: Array<{
        type: string;
        count: number;
    }>;
    mostUsedUnits: Array<{
        id: number;
        name: string;
        symbol: string;
        productCount: number;
    }>;
    recentUnits: Unit[];
}

export const createUnit = async (unit: { 
    name: string; 
    symbol?: string;
    description?: string;
    unitType?: string;
    isDecimal?: boolean;
}) => {
    const response = await api.post("/units", unit);
    return response.data;
}

export const getUnits = async (params?: { 
    includeInactive?: boolean; 
    search?: string;
    unitType?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.includeInactive) queryParams.append('includeInactive', 'true');
    if (params?.search) queryParams.append('search', params.search);
    if (params?.unitType) queryParams.append('unitType', params.unitType);
    
    const response = await api.get(`/units?${queryParams.toString()}`);
    // El backend devuelve { success: true, data: { success: true, data: units[] } }
    const responseData = response.data.success ? response.data.data : response.data;
    return responseData.success ? responseData.data : responseData;
}

export const getUnitStatistics = async (): Promise<UnitStatistics> => {
    const response = await api.get("/units/statistics");
    // El backend devuelve { success: true, data: { success: true, data: statistics } }
    const responseData = response.data.success ? response.data.data : response.data;
    return responseData.success ? responseData.data : responseData;
}

export const getUnitsByType = async (type: string): Promise<Unit[]> => {
    const response = await api.get(`/units/by-type/${type}`);
    // El backend devuelve { success: true, data: { success: true, data: units[] } }
    const responseData = response.data.success ? response.data.data : response.data;
    return responseData.success ? responseData.data : responseData;
}

export const getUnitById = async (id: number): Promise<Unit> => {
    const response = await api.get(`/units/${id}`);
    // El backend devuelve { success: true, data: { success: true, data: unit } }
    const responseData = response.data.success ? response.data.data : response.data;
    return responseData.success ? responseData.data : responseData;
}

export const updateUnit = async (unit: { 
    id: number; 
    name: string;
    symbol?: string;
    description?: string;
    unitType?: string;
    isDecimal?: boolean;
}) => {
    const response = await api.put(`/units/${unit.id}`, { 
        name: unit.name,
        symbol: unit.symbol,
        description: unit.description,
        unitType: unit.unitType,
        isDecimal: unit.isDecimal
    });
    return response.data;
}

export const deleteUnit = async (id: number) => {
    const response = await api.delete(`/units/${id}`);
    return response.data;
}

export const toggleUnitStatus = async (id: number) => {
    const response = await api.put(`/units/${id}/toggle-status`);
    return response.data;
}