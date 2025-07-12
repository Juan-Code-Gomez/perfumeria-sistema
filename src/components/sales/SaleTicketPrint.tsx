// src/components/sales/SaleTicketPrint.tsx
import React, { useRef } from "react";
import dayjs from "dayjs";
import { Button } from "antd";

// Usamos este hook para imprimir solo el ticket
const usePrint = (ref: React.RefObject<HTMLDivElement | null>) => {
  return () => {
    const printContents = ref.current?.innerHTML;
    const win = window.open("", "PRINT", "width=400,height=600");
    if (win && printContents) {
      win.document.write(`
        <html>
          <head>
            <title>Ticket de venta</title>
            <style>
              body { font-family: monospace; margin:0; padding:8px; width: 58mm; }
              .ticket { width: 58mm; margin: 0 auto; }
              .logo { 
                max-width: 45mm; 
                max-height: 20mm; 
                width: auto; 
                height: auto; 
                margin: 0 auto 8px auto; 
                display: block; 
                object-fit: contain;
              }
              .titulo { text-align:center; font-size:1.1em; font-weight:bold; margin-bottom:4px; }
              .separador { border-top: 1px dashed #000; margin: 4px 0; }
              .productos th, .productos td { font-size: 0.95em; padding: 2px; }
              .totales { margin-top: 4px; }
              .gracias { text-align:center; margin-top:8px; font-size:0.95em; }
              @media print { 
                body { width: 58mm; } 
                .logo { max-width: 45mm; max-height: 20mm; }
              }
            </style>
          </head>
          <body onload="window.print(); window.close()">
            ${printContents}
          </body>
        </html>
      `);
      win.document.close();
    }
  };
};

const SaleTicketPrint: React.FC<{ sale: any; onClose: () => void }> = ({ sale, onClose }) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const printTicket = usePrint(ticketRef);

  if (!sale) return null;

  // Ejemplo: logo, negocio, fecha, productos, totales, método pago
  return (
    <div>
      {/* Modal/header de cierre */}
      <div style={{ textAlign: "right", marginBottom: 10 }}>
        <Button onClick={onClose}>Cerrar</Button>
        <Button onClick={printTicket} style={{ marginLeft: 10 }}>Imprimir</Button>
      </div>

      {/* Contenido real del ticket */}
      <div ref={ticketRef} className="ticket">
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <img 
            src="/logo-milan.png" 
            alt="Logo Milán Fragancias" 
            className="logo"
            style={{
              maxWidth: "45mm",
              maxHeight: "20mm",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              display: "block",
              margin: "0 auto"
            }}
            onError={(e) => {
              // Si el logo falla al cargar, ocultar la imagen
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <div className="titulo">Milán Fragancias</div>
        <div style={{ textAlign: "center", fontSize: "0.9em" }}>
          Centro comercial el competidor<br />
          Local 119<br />
          Carrera 9 # 14-03, Cali<br />
          Tel: 312 3050704
        </div>
        <div style={{ textAlign: "center", fontSize: "0.9em" }}>
          <b>Venta #{sale.id}</b> — {dayjs(sale.date).format("YYYY-MM-DD HH:mm")}
        </div>
        <div className="separador" />
        <div style={{ fontSize: "0.92em" }}>
          Cliente: <b>{sale.customerName || "Consumidor final"}</b>
        </div>
        <div className="separador" />

        <table className="productos" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Producto</th>
              <th style={{ textAlign: "right" }}>Cant</th>
              <th style={{ textAlign: "right" }}>V. Unit</th>
              <th style={{ textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.details.map((item: any) => (
              <tr key={item.id}>
                <td>{item.product?.name}</td>
                <td style={{ textAlign: "right" }}>{item.quantity}</td>
                <td style={{ textAlign: "right" }}>${item.unitPrice.toLocaleString()}</td>
                <td style={{ textAlign: "right" }}>${item.totalPrice.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="separador" />
        <div className="totales" style={{ fontSize: "1em" }}>
          <div><b>Total: </b>${sale.totalAmount.toLocaleString()}</div>
          <div><b>Pagado: </b>${sale.paidAmount.toLocaleString()}</div>
          <div>
            <b>Método: </b>{sale.paymentMethod || "Efectivo"}
          </div>
          <div>
            <b>Estado: </b>
            {sale.isPaid
              ? <span style={{ color: "green" }}>Pagada</span>
              : <span style={{ color: "orange" }}>Pendiente</span>}
          </div>
        </div>
        <div className="separador" />
        <div className="gracias">
          ¡Gracias por su compra!<br />
          <span style={{ fontSize: "0.87em" }}>Síguenos en Instagram: @milanfragancias</span>
        </div>
      </div>
    </div>
  );
};

export default SaleTicketPrint;
