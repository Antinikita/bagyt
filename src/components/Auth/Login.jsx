import { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // <--- ПРОВЕРЬ ПУТЬ
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  // const navigate = useNavigate(); // Не нужно, GuestLayout сам перекинет

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Редирект произойдет автоматически из-за изменения user в GuestLayout
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };
  
  // ... дальше твой JSX ...
  return (
     // ... твой код формы ...
     <form onSubmit={handleSubmit}>
        {/* ... */}
     </form>
  )
}