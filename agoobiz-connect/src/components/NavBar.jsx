import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/">AGOOBIZ CONNECT</Link>

      <Link to="/products">Products</Link>

      {user?.role === 'Customer' && (
        <Link to="/cart">Cart ({cartItems.length})</Link>
      )}

      {user?.role === 'Seller' && (
        <Link to="/seller/dashboard">Seller Dashboard</Link>
      )}

      {user?.role === 'Admin' && (
        <Link to="/admin/dashboard">Admin Dashboard</Link>
      )}

      {!user && <Link to="/login">Login</Link>}

      {user && <button onClick={handleLogout}>Logout</button>}
    </nav>
  );
}