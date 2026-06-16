import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [currentTab, setCurrentTab] = useState('customerForm');
  const [successMessage, setSuccessMessage] = useState('');
  const [orders, setOrders] = useState([]);
  const [quantity, setQuantity] = useState(1);
  
  // Security & Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Customer Validation State (Ready for Backend Integration)
  const [isCustomerValidated, setIsCustomerValidated] = useState(false);
  const [otpInput, setOtpInput] = useState('');

  const API_BASE_URL = 'https://biryani-backend-zz0w.onrender.com';
  const PRICE_PER_PLATE = 150;

  // Check for existing JWT token on load
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAdminAuthenticated(true);
      fetchOrders(token);
    }
  }, []);

  useEffect(() => {
    if (successMessage || isAdminAuthenticated) fetchOrders();
  }, [successMessage, isAdminAuthenticated]);

  // --- NEW JWT LOGIN FLOW ---
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      /* NOTE: This is ready for your new backend route!
        const res = await axios.post(`${API_BASE_URL}/admin/login`, { username: adminUsername, password: adminPassword });
        localStorage.setItem('adminToken', res.data.token);
      */
      
      // Temporary bypass until your backend JWT route is built:
      if (adminUsername === 'admin' && adminPassword === 'securepassword123') {
        localStorage.setItem('adminToken', 'temp_mock_jwt_token');
        setIsAdminAuthenticated(true);
        setAuthError('');
      } else {
        setAuthError('Invalid credentials');
      }
    } catch (error) {
      setAuthError('Server error during login.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdminAuthenticated(false);
    setCurrentTab('customerForm');
  };

  // --- ORDER SUBMISSION ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isCustomerValidated) {
      alert("Please validate your phone number with an OTP first.");
      return;
    }

    const customer_name = event.target.customer_name.value;
    const phone_number = event.target.phone_number.value;

    try {
      // Your backend will trigger the Nodemailer email to Mom inside this route
      await axios.post(`${API_BASE_URL}/orders`, { customer_name, phone_number, quantity });
      setSuccessMessage('Order placed successfully!');
      event.target.reset();
      setQuantity(1);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchOrders();
    } catch (error) { alert('Failed to place order.'); }
  };

  const fetchOrders = async (token = localStorage.getItem('adminToken')) => {
    try {
      // In the future, pass the JWT token in the headers for security:
      // const response = await axios.get(`${API_BASE_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } });
      const response = await axios.get(`${API_BASE_URL}/orders`);
      setOrders(response.data);
    } catch (error) { console.error(error); }
  };

  const toggleOrderStatus = async (id, status) => {
    const newStatus = status === 'Pending' ? 'Delivered' : 'Pending';
    await axios.put(`${API_BASE_URL}/orders/${id}/status`, { status: newStatus });
    fetchOrders();
  };

  // --- UI RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-4 md:p-8 font-[Poppins] text-gray-900">
      <style dangerouslySetInnerHTML={{__html: `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;800&display=swap');`}} />

      <div className="max-w-4xl mx-auto">
        {/* Navbar */}
        <nav className="flex justify-between items-center bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-amber-600 ml-2 tracking-tighter">Biryani Co.</h1>
          <div className="flex bg-white/50 p-1 rounded-2xl">
            <button onClick={() => setCurrentTab('customerForm')} className={`px-4 md:px-5 py-2 rounded-xl font-bold transition ${currentTab === 'customerForm' ? 'bg-orange-500 text-white shadow-lg' : 'text-amber-800'}`}>Order</button>
            <button onClick={() => setCurrentTab('adminDashboard')} className={`px-4 md:px-5 py-2 rounded-xl font-bold transition ${currentTab === 'adminDashboard' ? 'bg-orange-500 text-white shadow-lg' : 'text-amber-800'}`}>Admin</button>
          </div>
        </nav>

        {/* CUSTOMER FORM */}
        {currentTab === 'customerForm' ? (
          <div className="max-w-xl mx-auto bg-white/70 backdrop-blur-2xl border border-white/50 p-6 md:p-8 rounded-[2rem] shadow-2xl flex flex-col gap-6">
            <img src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Biryani" className="w-full h-48 md:h-56 object-cover rounded-2xl shadow-inner mb-2"/>
            <h2 className="text-3xl font-extrabold text-gray-800">Fresh & Hot</h2>
            
            {!isCustomerValidated ? (
              <div className="bg-amber-100/50 p-6 rounded-2xl border border-amber-200">
                <h3 className="font-bold text-amber-800 mb-2">Account Validation</h3>
                <p className="text-sm text-gray-600 mb-4">Enter your phone number to receive a login OTP.</p>
                <div className="flex gap-2">
                  <input type="tel" placeholder="Phone Number" className="w-full p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-amber-400" />
                  <button onClick={() => setIsCustomerValidated(true)} className="bg-amber-500 text-white px-4 py-2 rounded-xl font-bold whitespace-nowrap">Send OTP</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-in fade-in">
                {successMessage && <div className="bg-green-100 p-4 rounded-xl text-green-800 font-bold text-center">{successMessage}</div>}
                
                <input type="text" name="customer_name" placeholder="Full Name" required className="w-full p-4 rounded-xl bg-white border border-gray-100 focus:ring-2 focus:ring-orange-400 outline-none" />
                <input type="tel" name="phone_number" placeholder="Phone Number" required pattern="[0-9]{10}" className="w-full p-4 rounded-xl bg-white border border-gray-100 focus:ring-2 focus:ring-orange-400 outline-none" />
                
                <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-100">
                  <span className="ml-4 font-bold text-gray-500">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 bg-gray-100 rounded-lg font-bold">-</button>
                    <span className="font-extrabold text-xl w-6 text-center">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 bg-orange-500 text-white rounded-lg font-bold">+</button>
                  </div>
                </div>

                <button type="submit" className="w-full py-4 rounded-2xl bg-orange-500 text-white font-extrabold text-lg shadow-xl hover:bg-orange-600 transition">
                  Order Now — ₹{quantity * PRICE_PER_PLATE}
                </button>
              </form>
            )}
          </div>
        ) : (

        /* ADMIN DASHBOARD */
          <div className="bg-white/70 backdrop-blur-2xl border border-white/50 p-6 md:p-8 rounded-[2rem] shadow-2xl">
            {!isAdminAuthenticated ? (
              <form onSubmit={handleAdminLogin} className="flex flex-col gap-4 text-center max-w-sm mx-auto py-8">
                <div className="w-16 h-16 bg-gray-900 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Secure JWT Login</h2>
                <input type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} placeholder="Admin Username" required className="p-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-gray-900" />
                <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Password" required className="p-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-gray-900" />
                {authError && <p className="text-red-500 font-bold text-sm">{authError}</p>}
                <button type="submit" className="py-4 bg-gray-900 text-white rounded-xl font-bold shadow-xl hover:bg-gray-800 transition">Authenticate</button>
              </form>
            ) : (
              <div className="animate-in fade-in">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-gray-800">Operations Vault</h2>
                    <p className="text-gray-500 font-medium">Total Revenue: <span className="text-green-600 font-bold">₹{orders.reduce((sum, o) => sum + (o.quantity * PRICE_PER_PLATE), 0)}</span></p>
                  </div>
                  <button onClick={handleLogout} className="px-6 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition">Log Out</button>
                </div>
                
                <div className="overflow-x-auto bg-white/50 rounded-2xl border border-gray-100 shadow-sm">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-gray-50/50">
                      <tr className="text-gray-400 uppercase text-xs tracking-wider">
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Qty</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map(o => (
                        <tr key={o.id} className="hover:bg-white transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                            {/* Formatting the created_at timestamp from your database */}
                            {new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-800">{o.customer_name}</td>
                          <td className="px-6 py-4 font-medium text-gray-600">{o.phone_number}</td>
                          <td className="px-6 py-4 font-black text-amber-500 text-lg">{o.quantity}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-black tracking-wide uppercase ${o.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => toggleOrderStatus(o.id, o.status)} className="text-xs bg-gray-100 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition">Toggle</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
