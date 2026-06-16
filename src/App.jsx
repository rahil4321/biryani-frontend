import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [currentTab, setCurrentTab] = useState('customerForm');
  const [successMessage, setSuccessMessage] = useState('');
  const [orders, setOrders] = useState([]);
  
  // New Interactive Quantity State
  const [quantity, setQuantity] = useState(1);
  
  // Security State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Constants
  const API_BASE_URL = 'https://biryani-backend-zz0w.onrender.com';
  const PRICE_PER_PLATE = 150;

  useEffect(() => {
    if (successMessage || isAdminAuthenticated) {
      fetchOrders();
    }
  }, [successMessage, isAdminAuthenticated]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const customer_name = event.target.customer_name.value;
    const phone_number = event.target.phone_number.value;

    try {
      await axios.post(`${API_BASE_URL}/orders`, { customer_name, phone_number, quantity });
      setSuccessMessage('Order submitted successfully!');
      event.target.reset();
      setQuantity(1); // Reset quantity UI
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchOrders();
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order.');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const toggleOrderStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Delivered' : 'Pending';
    try {
      await axios.put(`${API_BASE_URL}/orders/${id}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === '1234') {
      setIsAdminAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const totalOrders = orders.length;
  const totalPlates = orders.reduce((sum, order) => sum + order.quantity, 0);
  const expectedRevenue = totalPlates * PRICE_PER_PLATE;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 p-4 md:p-8 font-[Poppins]">
      
      {/* Import Poppins Font */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap');
      `}} />

      <div className="max-w-5xl mx-auto">
        
        {/* Glassmorphic Header */}
        <nav className="flex justify-between items-center bg-white/40 backdrop-blur-xl border border-white/50 shadow-xl rounded-3xl p-5 mb-10">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 tracking-tight ml-4">
            Biryani Co.
          </h1>
          <div className="flex bg-white/50 p-1 rounded-2xl border border-white/50 shadow-inner">
            <button
              onClick={() => setCurrentTab('customerForm')}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${currentTab === 'customerForm' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'text-amber-800 hover:bg-white/60'}`}
            >
              Order
            </button>
            <button
              onClick={() => setCurrentTab('adminDashboard')}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${currentTab === 'adminDashboard' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'text-amber-800 hover:bg-white/60'}`}
            >
              Admin
            </button>
          </div>
        </nav>

        {/* CUSTOMER FORM */}
        {currentTab === 'customerForm' && (
          <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-2xl border border-white/60 p-8 md:p-10 rounded-[2rem] shadow-2xl flex flex-col gap-8 max-w-lg mx-auto transform transition-all duration-500 hover:shadow-orange-500/10">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold text-gray-800 mb-2">Fresh Biryani</h2>
              <p className="text-amber-700 font-medium">Delivered hot to your door.</p>
            </div>
            
            {successMessage && (
              <div className="bg-green-100/80 backdrop-blur-md border border-green-200 text-green-800 p-4 rounded-2xl text-center font-bold shadow-inner">
                {successMessage}
              </div>
            )}
            
            <div className="space-y-5">
              <input type="text" name="customer_name" placeholder="Full Name" required className="w-full px-6 py-4 rounded-2xl bg-white/70 border border-white focus:outline-none focus:ring-4 focus:ring-amber-500/30 transition-all font-semibold text-gray-800 shadow-sm placeholder-gray-400" />
              <input type="tel" name="phone_number" placeholder="Phone Number" required pattern="[0-9]{10}" className="w-full px-6 py-4 rounded-2xl bg-white/70 border border-white focus:outline-none focus:ring-4 focus:ring-amber-500/30 transition-all font-semibold text-gray-800 shadow-sm placeholder-gray-400" />
              
              {/* Premium Quantity Selector */}
              <div className="bg-white/70 rounded-2xl border border-white p-2 shadow-sm flex items-center justify-between">
                <span className="ml-4 font-bold text-gray-600 uppercase tracking-wider text-sm">Quantity</span>
                <div className="flex items-center gap-4 bg-gray-100/50 p-1 rounded-xl">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 rounded-lg bg-white shadow-sm font-bold text-xl text-amber-600 hover:bg-amber-50 transition-colors flex items-center justify-center active:scale-95">
                    -
                  </button>
                  <span className="w-8 text-center font-extrabold text-2xl text-gray-800">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 rounded-lg bg-amber-500 shadow-sm font-bold text-xl text-white hover:bg-amber-600 transition-colors flex items-center justify-center active:scale-95">
                    +
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all duration-300 active:scale-95">
              Place Order — ₹{quantity * PRICE_PER_PLATE}
            </button>
          </form>
        )}

        {/* ADMIN TAB */}
        {currentTab === 'adminDashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* PIN SECURITY SCREEN */}
            {!isAdminAuthenticated ? (
              <form onSubmit={handlePinSubmit} className="bg-white/60 backdrop-blur-2xl border border-white/60 p-10 rounded-[2rem] shadow-2xl flex flex-col gap-6 max-w-md mx-auto mt-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30 mb-2">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-800">Secure Vault</h2>
                <input 
                  type="password" maxLength={4} value={pinInput} onChange={(e) => setPinInput(e.target.value)} placeholder="PIN" autoFocus
                  className="w-full px-6 py-5 text-center text-3xl tracking-[1em] rounded-2xl bg-white/80 border border-white focus:outline-none focus:ring-4 focus:ring-amber-500/30 shadow-inner font-bold text-gray-800"
                />
                {pinError && <p className="text-red-500 font-bold bg-red-100/50 py-2 rounded-lg">Invalid Access Code</p>}
                <button type="submit" className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold text-lg hover:bg-gray-800 hover:-translate-y-1 transition-all duration-300 shadow-xl active:scale-95 mt-2">
                  Authenticate
                </button>
              </form>
            ) : (

            /* UNLOCKED DASHBOARD */
            <div className="space-y-6">
              
              {/* Executive Revenue Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 transform transition-all duration-300 hover:-translate-y-1">
                  <span className="text-gray-500 text-sm font-extrabold uppercase tracking-widest mb-2 block">Total Orders</span>
                  <span className="text-5xl font-black text-gray-800">{totalOrders}</span>
                </div>
                <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 transform transition-all duration-300 hover:-translate-y-1">
                  <span className="text-gray-500 text-sm font-extrabold uppercase tracking-widest mb-2 block">Plates Sold</span>
                  <span className="text-5xl font-black text-amber-600">{totalPlates}</span>
                </div>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl shadow-2xl shadow-gray-900/30 transform transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl"></div>
                  <span className="text-gray-400 text-sm font-extrabold uppercase tracking-widest mb-2 block relative z-10">Expected Rev</span>
                  <span className="text-5xl font-black text-white relative z-10">₹{expectedRevenue}</span>
                </div>
              </div>

              {/* Glass Table */}
              <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/60 overflow-hidden">
                <div className="p-8 border-b border-white/40 flex justify-between items-center bg-white/30">
                  <h2 className="text-2xl font-black text-gray-800">Kitchen Operations</h2>
                  <button onClick={() => setIsAdminAuthenticated(false)} className="px-4 py-2 bg-white/50 rounded-lg text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm">
                    Lock Terminal
                  </button>
                </div>
                <div className="overflow-x-auto p-4">
                  <table className="w-full table-auto border-collapse min-w-[800px]">
                    <thead>
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Contact</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Qty</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/40">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-white/50 transition-colors">
                          <td className="px-6 py-5 text-gray-800 font-extrabold text-lg">{order.customer_name}</td>
                          <td className="px-6 py-5 text-gray-500 font-semibold">{order.phone_number}</td>
                          <td className="px-6 py-5 text-amber-600 font-black text-2xl">{order.quantity}</td>
                          <td className="px-6 py-5">
                            <span className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase ${order.status === 'Delivered' ? 'bg-green-100 text-green-700 shadow-inner' : 'bg-orange-100 text-orange-700 shadow-inner'}`}>
                              {order.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button
                              onClick={() => toggleOrderStatus(order.id, order.status || 'Pending')}
                              className={`px-6 py-3 text-sm font-black rounded-xl transition-all shadow-md hover:-translate-y-0.5 active:scale-95 ${order.status === 'Delivered' ? 'bg-white text-gray-400 hover:text-gray-600' : 'bg-amber-500 text-white hover:bg-amber-600 hover:shadow-amber-500/30'}`}
                            >
                              {order.status === 'Delivered' ? 'Revert' : 'Mark Delivered'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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