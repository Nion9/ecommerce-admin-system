import { useEffect, useMemo, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { apiRequest, clearAuthToken, saveAuthToken } from './api';

const menuItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'Orders', path: '/orders' },
  { label: 'Customers', path: '/customers' },
  { label: 'Reports', path: '/reports' },
  { label: 'Settings', path: '/settings' }
];

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('adminToken') || '');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('adminUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (token, currentUser) => {
    setAuthToken(token);
    setUser(currentUser);
    saveAuthToken(token, currentUser);
  };

  const handleLogout = () => {
    setAuthToken('');
    setUser(null);
    clearAuthToken();
  };

  if (!authToken) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-pill">N</div>
          <div>
            <h3>Northstar</h3>
            <small>Admin Portal</small>
          </div>
        </div>

        <nav className="nav-menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="profile-box">
          <div className="avatar">{user?.name?.charAt(0) || 'A'}</div>
          <div>
            <strong>{user?.name || 'Admin'}</strong>
            <small>{user?.email || 'admin@admin.com'}</small>
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="main-panel">
        <Routes>
          <Route path="/" element={<DashboardPage token={authToken} />} />
          <Route path="/products" element={<ProductsPage token={authToken} />} />
          <Route path="/orders" element={<OrdersPage token={authToken} />} />
          <Route path="/customers" element={<CustomersPage token={authToken} />} />
          <Route path="/reports" element={<ReportsPage token={authToken} />} />
          <Route path="/settings" element={<SettingsPage token={authToken} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('admin@admin.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-header">
          <div className="brand-pill large">N</div>
          <h1>Northstar Commerce</h1>
          <p>Admin access portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          {error ? <div className="error-box">{error}</div> : null}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

function DashboardPage({ token }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/dashboard', { method: 'GET', token })
      .then((data) => setDashboard(data))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <LoadingState label="Loading dashboard" />;
  if (!dashboard) return <ErrorState message="Unable to load dashboard data" />;

  const { stats, recentOrders, topProducts, activity } = dashboard;

  return (
    <div className="page-wrap">
      <PageHeader title="Dashboard" subtitle="Business overview" />

      <div className="stats-grid">
        <StatCard title="Revenue" value={`$${stats.revenue.toLocaleString()}`} change="+12.8%" />
        <StatCard title="Orders" value={stats.orders} change="+8.5%" />
        <StatCard title="Customers" value={stats.customers} change="+15.3%" />
        <StatCard title="Products" value={stats.products} change={stats.lowStock ? `${stats.lowStock} low stock` : 'Healthy'} />
      </div>

      <div className="double-grid">
        <Panel title="Recent orders">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td><span className="status-badge">{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Top products">
          <ul className="simple-list">
            {topProducts.map((product) => (
              <li key={product.name}>
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.sales} sales</span>
                </div>
                <b>${product.revenue.toFixed(2)}</b>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Recent activity">
        <ul className="activity-list">
          {activity.map((item) => (
            <li key={item.id}>
              <span className="dot" />
              <div>
                <strong>{item.type}</strong>
                <p>{item.message}</p>
              </div>
              <small>{new Date(item.createdAt).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function ProductsPage({ token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    cost: '',
    stock: '',
    category: '',
    image: ''
  });

  const loadProducts = async () => {
    const data = await apiRequest('/products', { method: 'GET', token });
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await apiRequest('/products', {
      method: 'POST',
      token,
      body: form
    });
    setForm({ sku: '', name: '', description: '', price: '', cost: '', stock: '', category: '', image: '' });
    loadProducts();
  };

  const handleDelete = async (productId) => {
    await apiRequest(`/products/${productId}`, { method: 'DELETE', token });
    loadProducts();
  };

  if (loading) return <LoadingState label="Loading products" />;

  return (
    <div className="page-wrap">
      <PageHeader title="Products" subtitle="Catalog management" />

      <Panel title="Add new product">
        <form className="product-form" onSubmit={handleSubmit}>
          <div className="grid-2">
            <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input type="number" placeholder="Cost" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            <div />
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button type="submit" className="primary-button">Save product</button>
        </form>
      </Panel>

      <Panel title="Inventory list">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td>${Number(product.price).toFixed(2)}</td>
                <td>{product.stock}</td>
                <td><span className="status-badge">{product.status}</span></td>
                <td>
                  <button className="danger-button" onClick={() => handleDelete(product.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function OrdersPage({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    const data = await apiRequest('/orders', { method: 'GET', token });
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  const updateStatus = async (orderId, status) => {
    await apiRequest(`/orders/${orderId}/status`, {
      method: 'PATCH',
      token,
      body: { status }
    });
    loadOrders();
  };

  if (loading) return <LoadingState label="Loading orders" />;

  return (
    <div className="page-wrap">
      <PageHeader title="Orders" subtitle="Order fulfillment" />

      <Panel title="All orders">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>{order.customerName}</td>
                <td>${order.total.toFixed(2)}</td>
                <td>{order.status}</td>
                <td>
                  <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function CustomersPage({ token }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/customers', { method: 'GET', token })
      .then((data) => setCustomers(data))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <LoadingState label="Loading customers" />;

  return (
    <div className="page-wrap">
      <PageHeader title="Customers" subtitle="Customer relationship management" />

      <Panel title="Customer list">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Lifetime Spend</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{customer.city}</td>
                <td>${customer.totalSpent.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function ReportsPage({ token }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/reports', { method: 'GET', token })
      .then(setReport)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <LoadingState label="Loading reports" />;

  return (
    <div className="page-wrap">
      <PageHeader title="Reports" subtitle="Performance analysis" />

      <div className="stats-grid">
        <StatCard title="Conversion Rate" value={`${report.performance.conversionRate}%`} change="Up" />
        <StatCard title="AOV" value={`$${report.performance.averageOrderValue.toFixed(2)}`} change="Stable" />
        <StatCard title="Repeat Purchase" value={`${report.performance.repeatPurchaseRate}%`} change="Growing" />
      </div>

      <Panel title="Monthly revenue">
        <div className="bar-chart">
          {report.monthlyRevenue.map((item) => (
            <div key={item.month} className="bar-item">
              <div className="bar-value" style={{ height: `${(item.revenue / 35000) * 100}%` }} />
              <span>{item.month}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function SettingsPage({ token }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/settings', { method: 'GET', token })
      .then(setSettings)
      .finally(() => setLoading(false));
  }, [token]);

  const updateSettings = async (event) => {
    event.preventDefault();
    const updated = await apiRequest('/settings', { method: 'PUT', token, body: settings });
    setSettings(updated);
  };

  if (loading) return <LoadingState label="Loading settings" />;

  return (
    <div className="page-wrap">
      <PageHeader title="Settings" subtitle="Store configuration" />

      <Panel title="Business details">
        <form className="settings-form" onSubmit={updateSettings}>
          <div className="grid-2">
            <input value={settings.storeName || ''} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} />
            <input value={settings.email || ''} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
            <input value={settings.currency || ''} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} />
            <input value={settings.timezone || ''} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} />
            <input type="number" value={settings.taxRate || 0} onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })} />
            <input type="number" value={settings.shippingFee || 0} onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })} />
          </div>
          <button type="submit" className="primary-button">Save settings</button>
        </form>
      </Panel>
    </div>
  );
}

function PageHeader({ title, subtitle }) {
  return (
    <div className="page-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="panel">
      <header>{title}</header>
      {children}
    </section>
  );
}

function StatCard({ title, value, change }) {
  return (
    <div className="stat-card">
      <small>{title}</small>
      <h3>{value}</h3>
      <span>{change}</span>
    </div>
  );
}

function LoadingState({ label }) {
  return <div className="state-box">{label}</div>;
}

function ErrorState({ message }) {
  return <div className="state-box error-state">{message}</div>;
}

export default App;
