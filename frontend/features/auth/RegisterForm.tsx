
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      showToast('Nom, email et mot de passe requis.', 'error');
      return;
    }

    if (password.length < 3) {
      showToast('Le mot de passe est trop court.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Les mots de passe ne correspondent pas.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(username.trim(), email.trim(), password);
      showToast('Compte cree avec succes.', 'success');
      navigate('/home');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Impossible de creer le compte.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
     <img src={logo} alt="logo" className='w-60 h-auto bg-cover absolute top-2 mx-10'/>
    <div className="flex flex-col items-center">
      <h2 className="bg-[#5D5D5B] text-[#F3E5AB] px-8 py-2 text-2xl font-bold mb-8 shadow-md">
        Register
      </h2>

      <form className="w-full space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <label className="text-lg font-semibold mb-1 text-accent-content">User</label>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="user-name"
            className="w-full p-2 border border-gray-400 rounded-md bg-transparent focus:ring-2 focus:ring-black outline-none text-accent-content"
          />
        </div>

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

        <div className="flex flex-col">
          <label className="text-lg font-semibold mb-1 text-accent-content">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="repeat password"
            className="w-full p-2 border border-gray-400 rounded-md bg-transparent focus:ring-2 focus:ring-black outline-none text-accent-content"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#5D5D5B] text-[#F3E5AB] py-3 rounded-md font-bold text-xl shadow-lg mt-6 disabled:opacity-60"
        >
          {isSubmitting ? 'creation...' : 'submit'}
        </button>
      </form>

      <div className="mt-6">
        <Link to="/login" className="text-blue-800 hover:underline font-bold">Back to login</Link>
      </div>
    </div>
    </>
  );
};

export default RegisterForm;
