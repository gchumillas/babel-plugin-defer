interface WelcomeProps {
  name: string;
  message?: string;
}

const Welcome: React.FC<WelcomeProps> = ({ name, message = "Bienvenido a React!" }) => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '8px', margin: '20px 0' }}>
      <h2>¡Hola, {name}!</h2>
      <p>{message}</p>
      <p>Esta es una aplicación React con TypeScript y Vite.</p>
    </div>
  );
};

export default Welcome;
