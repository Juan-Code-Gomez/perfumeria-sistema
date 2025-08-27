// Este es un archivo temporal para verificar la sintaxis
const test = () => {
  return (
    <div>
      <Modal
        open={true}
        title="Test"
        onCancel={() => {}}
        onOk={() => {}}
        okButtonProps={{
          disabled: false,
          style: {
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            border: 'none',
            borderRadius: '8px'
          }
        }}
        style={{
          borderRadius: '16px'
        }}
      >
        <div>Test content</div>
      </Modal>
    </div>
  );
};

export default test;
