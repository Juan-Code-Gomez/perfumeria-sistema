// src/components/ClientSelector.tsx
import React, { useState, useEffect } from 'react';
import { AutoComplete, Input, Modal, message, Button } from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/index';
import { searchClients, addClient } from '../../features/clients/clientSlice';
import ClientForm from './ClientForm';
import type { Client, ClientCreateData } from '../../features/clients/types';

interface OptionType {
  value: string;
  label: React.ReactNode;
  client: Client | null;
}

interface ClientSelectorProps {
  onSelectClient: (client: Client | null) => void;
  value?: Client | null;
  placeholder?: string;
  allowClear?: boolean;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ 
  onSelectClient, 
  value,
  placeholder = "Buscar cliente por nombre...",
  allowClear = true
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { clients, loading } = useSelector((s: RootState) => s.clients);
  const [searchValue, setSearchValue] = useState('');
  const [options, setOptions] = useState<OptionType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (value) {
      setSearchValue(value.name);
    } else {
      setSearchValue('');
    }
  }, [value]);

  useEffect(() => {
    if (searchValue.length >= 2) {
      dispatch(searchClients(searchValue));
    } else if (searchValue.length === 0) {
      dispatch(searchClients(''));
    }
  }, [searchValue, dispatch]);

  useEffect(() => {
    const clientOptions: OptionType[] = clients.map(client => ({
      value: client.name,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500 }}>{client.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {client.document && `${client.document} • `}
              {client.phone && `${client.phone}`}
            </div>
          </div>
          <UserOutlined style={{ color: '#1890ff' }} />
        </div>
      ),
      client
    }));

    // Agregar opción para crear nuevo cliente si hay texto de búsqueda
    if (searchValue && searchValue.length >= 2) {
      clientOptions.push({
        value: searchValue,
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', color: '#1890ff' }}>
            <PlusOutlined />
            <span>Crear nuevo cliente: "{searchValue}"</span>
          </div>
        ),
        client: null
      });
    }

    setOptions(clientOptions);
  }, [clients, searchValue]);

  const handleSelect = (_value: string, option: OptionType) => {
    if (option.client) {
      setSearchValue(option.client.name);
      onSelectClient(option.client);
    } else {
      // Crear nuevo cliente con el nombre buscado
      setModalVisible(true);
    }
  };

  const handleSearch = (text: string) => {
    setSearchValue(text);
    if (!text && allowClear) {
      onSelectClient(null);
    }
  };

  const handleClear = () => {
    setSearchValue('');
    onSelectClient(null);
  };

  const handleCreate = async (data: ClientCreateData) => {
    try {
      const newClient = await dispatch(addClient(data)).unwrap();
      message.success('Cliente creado exitosamente');
      setModalVisible(false);
      setSearchValue(newClient.name);
      onSelectClient(newClient);
    } catch (error) {
      message.error('Error al crear el cliente');
      console.error('Error:', error);
    }
  };

  return (
    <>
      <AutoComplete
        style={{ width: '100%' }}
        value={searchValue}
        options={options}
        onSelect={handleSelect}
        onSearch={handleSearch}
        placeholder={placeholder}
        notFoundContent={loading ? 'Buscando clientes...' : 'No se encontraron clientes'}
        allowClear={allowClear}
        onClear={handleClear}
        filterOption={false} // Desactivar filtrado local
      >
        <Input 
          prefix={<UserOutlined />}
          suffix={
            <Button 
              type="link" 
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              size="small"
              style={{ padding: 0 }}
              title="Crear nuevo cliente"
            />
          }
        />
      </AutoComplete>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined />
            Nuevo Cliente
          </div>
        }
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
        width={600}
      >
        <ClientForm 
          onFinish={handleCreate}
          loading={loading}
          initialValues={searchValue ? { name: searchValue } : undefined}
        />
      </Modal>
    </>
  );
};

export default ClientSelector;
