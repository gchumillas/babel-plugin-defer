interface WelcomeProps {
  name: string;
  message?: string;
}

const Welcome: React.FC<WelcomeProps> = ({ name, message = 'Welcome to React!' }) => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '8px', margin: '20px 0' }}>
      <h2>Hello, {name}!</h2>
      <p>{message}</p>
      <p>This is a React application with TypeScript and Vite.</p>
    </div>
  );
};

export default Welcome;
