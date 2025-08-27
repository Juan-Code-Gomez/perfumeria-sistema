// src/components/dashboard/MetricsCard.tsx
import React from 'react';
import { Card, Statistic, Typography, Progress, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string[];
  suffix?: string;
  prefix?: string;
  trend?: number;
  trendLabel?: string;
  progress?: number;
  target?: number;
  status?: 'success' | 'warning' | 'error' | 'info';
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon,
  gradient,
  suffix,
  prefix,
  trend,
  trendLabel,
  progress,
  target,
  status = 'info'
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendColor = (trend?: number) => {
    if (!trend) return '#666';
    return trend >= 0 ? '#52c41a' : '#ff4d4f';
  };

  const getProgressStatus = (progress?: number, target?: number) => {
    if (!progress || !target) return 'normal';
    const percentage = (progress / target) * 100;
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'normal';
    if (percentage >= 50) return 'active';
    return 'exception';
  };

  return (
    <Card
      className="hover:shadow-2xl transition-all duration-300 border-0"
      style={{
        background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
        color: 'white',
        borderRadius: '16px',
        overflow: 'hidden'
      }}
    >
      <div className="relative">
        {/* Patrón de fondo sutil */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
              {icon}
            </div>
            {trend !== undefined && (
              <div className="text-right">
                <div className="flex items-center text-white">
                  {trend >= 0 ? (
                    <ArrowUpOutlined className="mr-1" />
                  ) : (
                    <ArrowDownOutlined className="mr-1" />
                  )}
                  <span className="text-sm font-semibold">
                    {Math.abs(trend).toFixed(1)}%
                  </span>
                </div>
                {trendLabel && (
                  <Text className="text-white opacity-80 text-xs">
                    {trendLabel}
                  </Text>
                )}
              </div>
            )}
          </div>
          
          <div className="mb-3">
            <Text className="text-white opacity-90 text-sm block mb-2">
              {title}
            </Text>
            <div className="text-2xl font-bold text-white">
              {prefix}
              {typeof value === 'number' ? formatCurrency(value) : value}
              {suffix}
            </div>
          </div>

          {/* Progress bar si se proporciona */}
          {progress !== undefined && target !== undefined && (
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <Text className="text-white opacity-80 text-xs">
                  Progreso: {progress} / {target}
                </Text>
                <Text className="text-white opacity-80 text-xs">
                  {((progress / target) * 100).toFixed(1)}%
                </Text>
              </div>
              <Progress
                percent={(progress / target) * 100}
                status={getProgressStatus(progress, target)}
                strokeColor="rgba(255,255,255,0.8)"
                trailColor="rgba(255,255,255,0.2)"
                size="small"
                showInfo={false}
              />
            </div>
          )}

          {/* Estado/Tag si se proporciona */}
          {status && (
            <div className="mt-3">
              <Tag 
                color={status === 'success' ? 'green' : status === 'warning' ? 'orange' : status === 'error' ? 'red' : 'blue'}
                className="rounded-md"
              >
                {status === 'success' ? '✅ Excelente' : 
                 status === 'warning' ? '⚠️ Atención' :
                 status === 'error' ? '❌ Crítico' : 'ℹ️ Normal'}
              </Tag>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MetricsCard;
