// src/pages/admin/SystemConfigPage.tsx
import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined, SettingOutlined } from '@ant-design/icons';
import SystemParametersConfig from '../../components/admin/SystemParametersConfig';

const SystemConfigPage: React.FC = () => {
  return (
    <div>
      <Breadcrumb
        style={{ margin: '16px 0' }}
        items={[
          {
            href: '/',
            title: <HomeOutlined />,
          },
          {
            href: '/admin',
            title: 'Administración',
          },
          {
            title: (
              <>
                <SettingOutlined />
                <span>Configuración del Sistema</span>
              </>
            ),
          },
        ]}
      />
      <SystemParametersConfig />
    </div>
  );
};

export default SystemConfigPage;