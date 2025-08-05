// src/components/ClientSelector.tsx
import React, { useState, useEffect } from 'react';
import { AutoComplete, Input, Modal, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/index';
import { searchClients, addClient } from '../../features/clients/clientSlice';
import ClientForm from './ClientForm';

interface Client {
  id: number;
  name: string;
  document?: string;
}

interface OptionType {
  value: string;
  client: Client | null;
}

const ClientSelector: React.FC<{
  onSelectClient: (client: Client) => void;
}> = ({ onSelectClient }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { clients, loading } = useSelector((s: RootState) => s.clients);
  const [value, setValue] = useState('');
  const [options, setOptions] = useState<OptionType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    dispatch(searchClients(value));
  }, [value, dispatch]);

  useEffect(() => {
    const opts: OptionType[] = clients.map(c => ({ value: c.name, client: c }));
    opts.push({ value: '+ Crear nuevo cliente', client: null });
    setOptions(opts);
  }, [clients]);

  const handleSelect = (_val: string, option: OptionType) => {
    if (option.client) {
      setValue(option.client.name);
      onSelectClient(option.client);
    } else {
      setModalVisible(true);
    }
  };

  const handleSearch = (text: string) => {
    setValue(text);
  };

  const handleCreate = async (data: Omit<Client, 'id'>) => {
    try {
      const newClient = await dispatch(addClient(data)).unwrap();
      message.success('Cliente creado');
      setModalVisible(false);
      setValue(newClient.name);
      onSelectClient(newClient);
    } catch {
      message.error('No se pudo crear');
    }
  };

  return (
    <>
      <AutoComplete
        style={{ width: '100%' }}
        value={value}
        options={options}
        onSelect={handleSelect}
        onSearch={handleSearch}
        placeholder="Buscar o crear cliente"
        notFoundContent={loading ? 'Buscando…' : null}
      >
        <Input />
      </AutoComplete>

      <Modal
        title="Nuevo Cliente"
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <ClientForm onFinish={handleCreate} />
      </Modal>
    </>
  );
};

export default ClientSelector;
