import api from "./api";

export interface Unit {
    id: number;
    name: string;
    abbreviation?: string;
    unitType?: string;
    conversionFactor?: number;
    isActive: boolean;
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
        unitType: string;
        count: number;
    }>;
    mostUsedUnits: Array<{
        id: number;
        name: string;
        productCount: number;
    }>;
    recentUnits: Unit[];
}

export const createUnit = async (unit: { 
    name: string; 
    abbreviation?: string;
    unitType?: string;
    conversionFactor?: number;
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
    return response.data;
}

export const getUnitStatistics = async (): Promise<UnitStatistics> => {
    const response = await api.get("/units/statistics");
    return response.data;
}

export const getUnitsByType = async (type: string): Promise<Unit[]> => {
    const response = await api.get(`/units/by-type/${type}`);
    return response.data;
}

export const getUnitById = async (id: number): Promise<Unit> => {
    const response = await api.get(`/units/${id}`);
    return response.data;
}

export const updateUnit = async (unit: { 
    id: number; 
    name: string;
    abbreviation?: string;
    unitType?: string;
    conversionFactor?: number;
}) => {
    const response = await api.put(`/units/${unit.id}`, { 
        name: unit.name,
        abbreviation: unit.abbreviation,
        unitType: unit.unitType,
        conversionFactor: unit.conversionFactor
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