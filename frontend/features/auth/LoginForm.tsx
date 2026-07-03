
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      showToast('Email et mot de passe requis.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      showToast('Connexion reussie.', 'success');
      navigate('/home');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Impossible de se connecter.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <img src={logo} alt="logo" className='w-60 h-auto bg-cover absolute top-12 mx-10'/>
    <div className="flex flex-col items-center">
      <h2 className="bg-[#5D5D5B] text-[#F3E5AB] px-8 py-2 text-2xl font-bold mb-8 shadow-md">
        login
      </h2>

      <form className="w-full space-y-6" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <label className="text-lg font-semibold mb-1 text-accent-content">Email</label>
          <input 
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="word@gmail.com"
            className="w-full p-2 border border-gray-400 rounded-md bg-transparent focus:ring-2 focus:ring-black outline-none text-accent-content"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-lg font-semibold mb-1 text-accent-content">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="8 character minimum"
            className="w-full p-2 border border-gray-400 rounded-md bg-transparent focus:ring-2 focus:ring-black outline-none text-accent-content"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#5D5D5B] text-[#F3E5AB] py-3 rounded-md font-bold text-xl shadow-lg hover:bg-[#4A4A48] transition-colors mt-4 disabled:opacity-60"
        >
          {isSubmitting ? 'connexion...' : 'connect'}
        </button>
      </form>

      <div className="mt-8 flex justify-between w-full text-sm font-medium">
        <button className="hover:underline">mot de passe oublie?</button>
        <Link to="/register" className="text-blue-800 hover:underline font-bold">sign in</Link>
      </div>
    </div>
    </>
  );
};

export default LoginForm;
