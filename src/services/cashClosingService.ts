import api from './api';

export const getCashClosings = async (params?: { dateFrom?: string; dateTo?: string }) => {
  try {
    console.log('Calling getCashClosings with params:', params);
    const response = await api.get('/cash-closing', { params });
    console.log('getCashClosings response:', response);
    
    let data;
    // Verificar si la respuesta tiene el wrapper de success
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      data = response.data.data; // Extraer data del wrapper
    } else {
      data = response.data; // Usar directamente si no hay wrapper
    }
    
    console.log('getCashClosings processed data:', data, 'Type:', typeof data, 'IsArray:', Array.isArray(data));
    // Asegurar que siempre devuelva un array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error getting cash closings:', error);
    throw error;
  }
};

export const createCashClosing = async (payload: any) => {
  try {
    const response = await api.post('/cash-closing', payload);
    
    let data;
    // Verificar si la respuesta tiene el wrapper de success
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      data = response.data.data; // Extraer data del wrapper
    } else {
      data = response.data; // Usar directamente si no hay wrapper
    }
    
    return data;
  } catch (error) {
    console.error('Error creating cash closing:', error);
    throw error;
  }
};

export const getCashClosingSummary = async (date: string) => {
  try {
    console.log('📊 Calling getCashClosingSummary with date:', date);
    const response = await api.get('/cash-closing/summary', { params: { date } });
    console.log('📈 getCashClosingSummary response:', response.data);
    
    // El endpoint ahora devuelve directamente los datos
    if (response.data) {
      return response.data;
    } else {
      throw new Error('No se pudo obtener el resumen del día');
    }
  } catch (error) {
    console.error('❌ Error getting cash closing summary:', error);
    throw error;
  }
};

// Agregar nuevos métodos para UPDATE y DELETE
export const updateCashClosing = async (id: number, payload: any) => {
  try {
    console.log('📝 Updating cash closing:', id, payload);
    const response = await api.put(`/cash-closing/${id}`, payload);
    console.log('✅ Update response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error updating cash closing:', error);
    throw error;
  }
};

export const deleteCashClosing = async (id: number) => {
  try {
    console.log('🗑️ Deleting cash closing:', id);
    const response = await api.delete(`/cash-closing/${id}`);
    console.log('✅ Delete response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting cash closing:', error);
    throw error;
  }
};
