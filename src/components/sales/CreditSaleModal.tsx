// src/components/sales/CreditSaleModal.tsx
import  { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  Form,
  DatePicker,
  Button,
  Table,
  Row,
  Col,
  message,
  Select,
  InputNumber,
} from 'antd';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';
import ClientSelector from '../clients/ClientSelector';
import * as productService from '../../services/productService';
import type { Product } from '../../features/products/types';
import { useAppDispatch } from '../../store';
import { createSale } from '../../features/sales/salesSlice';

const { Option } = Select;

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface SaleItem {
  key: number;
  productId?: number;
  quantity: number;
  unitPrice: number;
}

export default function CreditSaleModal({ open, onClose, onSaved }: Props) {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();

  const [rows, setRows] = useState<SaleItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{ id: number; name: string } | null>(null);

  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [productLoading, setProductLoading] = useState(false);

  const debouncedFetch = useCallback(
    debounce(async (q: string, cb: (ps: Product[]) => void) => {
      setProductLoading(true);
      try {
        const res = await productService.getProducts({ name: q, page:1, pageSize:10 });
        cb(res.data?.items || []);
      } catch {
        cb([]);
      } finally {
        setProductLoading(false);
      }
    }, 300),
    []
  );

  const handleAdd = () => {
    setRows(rs => [...rs, { key: Date.now(), quantity:1, unitPrice:0 }]);
  };
  const changeRow = (key:number, field:keyof SaleItem, v:any) => {
    setRows(rs => rs.map(r => r.key===key ? {...r,[field]:v}:r));
  };
  const removeRow = (key:number) => setRows(rs => rs.filter(r=>r.key!==key));

  const total = rows.reduce((s,r)=>s+ (r.quantity*r.unitPrice||0),0);

  const handleSubmit = async (vals:any) => {
    if (!selectedClient) {
      message.warning('Selecciona o crea un cliente');
      return;
    }
    if (rows.length===0) {
      message.warning('Agrega al menos un producto');
      return;
    }
    if (rows.some(r=>!r.productId||r.quantity<=0||r.unitPrice<0)) {
      message.warning('Verifica productos, cantidades y precios');
      return;
    }
    const details = rows.map(r=>({
      productId: r.productId!,
      quantity: r.quantity,
      unitPrice: r.unitPrice,
      totalPrice: r.quantity*r.unitPrice
    }));
    setSaving(true);
    try {
      await dispatch(createSale({
        clientId: selectedClient.id,
        date: vals.date.format('YYYY-MM-DD'),
        totalAmount: total,
        paidAmount: 0,
        isPaid: false,
        paymentMethod: 'Crédito',
        details,
      })).unwrap();
      message.success('Venta a crédito creada');
      onSaved();
      form.resetFields();
      setRows([]);
      setSelectedClient(null);
      onClose();
    } catch(e:any) {
      message.error(e.message||'Error al crear venta');
    } finally {
      setSaving(false);
    }
  };

  // cuando busques productos
  const onSearchProd = (q:string) => {
    debouncedFetch(q, setSuggestedProducts);
  };
  const onFocusProd = () => {
    debouncedFetch('', setSuggestedProducts);
  };
  const onSelectProd = (key:number, pid:number) => {
    const prod = suggestedProducts.find(p=>p.id===pid);
    changeRow(key,'productId',pid);
    if (prod) changeRow(key,'unitPrice',prod.salePrice||0);
  };

  const columns = [
    {
      title:'Producto', dataIndex:'productId', key:'p',
      render:(v:number, row:any)=>
        <Select
          showSearch value={v}
          style={{width:320}}
          onSearch={txt=>onSearchProd(txt)}
          onFocus={()=>onFocusProd()}
          loading={productLoading}
          filterOption={false}
          onChange={val=>onSelectProd(row.key,val)}
          placeholder="Buscar…"
        >
          {suggestedProducts.map(p=>
            <Option key={p.id} value={p.id}>
              {p.name} | {p.category?.name} | {p.unit?.name} | Stock:{p.stock}
            </Option>
          )}
        </Select>
    },
    {
      title:'Cant.', dataIndex:'quantity', key:'q',
      render:(v:number, row:any)=>
        <InputNumber
          min={1} value={v}
          onChange={val=>changeRow(row.key,'quantity',val)}
        />
    },
    {
      title:'P.Unit.', dataIndex:'unitPrice', key:'u',
      render:(v:number,row:any)=>
        <InputNumber
          min={0} value={v}
          onChange={val=>changeRow(row.key,'unitPrice',val)}
        />
    },
    {
      title:'Total', key:'t',
      render:(_:any,row:any)=><b>${(row.quantity*row.unitPrice||0).toLocaleString()}</b>
    },
    {
      title:'', key:'x',
      render:(_:any,row:any)=>
        <Button danger size="small" onClick={()=>removeRow(row.key)}>Quitar</Button>
    }
  ];

  // resetear al abrir
  useEffect(()=>{
    if(open){
      form.resetFields();
      setRows([]);
      setSuggestedProducts([]);
      setSelectedClient(null);
    }
  },[open,form]);

  return (
    <Modal
      open={open}
      title="Nueva venta a crédito"
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ date: dayjs() }}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="Cliente" required>
              <ClientSelector onSelectClient={setSelectedClient} />
            </Form.Item>
            {selectedClient && <p>Cliente: {selectedClient.name}</p>}
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Fecha"
              name="date"
              rules={[{ required: true, message: 'Selecciona fecha' }]}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width:'100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Table<SaleItem>
          dataSource={rows}
          columns={columns}
          rowKey="key"
          pagination={false}
          size="small"
        />
        <Button type="dashed" block onClick={handleAdd}>+ Agregar producto</Button>

        <Row justify="space-between" style={{ marginTop:16 }}>
          <Col>
            <b>Total: </b><span>${total.toLocaleString()}</span>
          </Col>
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
            >
              Crear venta a crédito
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
