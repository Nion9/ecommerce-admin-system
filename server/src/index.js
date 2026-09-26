import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

app.use(cors());
app.use(express.json());

const adminUser = {
  id: 'admin-1',
  name: 'Super Admin',
  email: 'admin@admin.com',
  password: 'admin123',
  role: 'admin'
};

const products = [
  { id: 'p-101', sku: 'ELE-001', name: 'Premium Wireless Headphones', description: 'High-fidelity audio with noise cancellation.', price: 249.99, cost: 140.5, stock: 34, category: 'Electronics', status: 'active', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80' },
  { id: 'p-102', sku: 'APP-002', name: 'Smartwatch Pro X', description: 'Fitness tracking and AMOLED display.', price: 399.0, cost: 235.0, stock: 18, category: 'Electronics', status: 'active', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80' },
  { id: 'p-103', sku: 'FAS-003', name: 'Classic Office Chair', description: 'Ergonomic seating for productive workdays.', price: 189.5, cost: 96.2, stock: 12, category: 'Furniture', status: 'active', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
  { id: 'p-104', sku: 'HOM-004', name: 'Minimal Desk Lamp', description: 'Soft ambient lighting for modern workspaces.', price: 79.0, cost: 34.8, stock: 42, category: 'Home', status: 'active', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' }
];

const customers = [
  { id: 'c-101', name: 'Alicia Morgan', email: 'alicia@example.com', phone: '+1 415 300 7788', city: 'San Francisco', totalSpent: 1289.45, orders: 7 },
  { id: 'c-102', name: 'Noah Patel', email: 'noah@example.com', phone: '+1 312 444 8822', city: 'Chicago', totalSpent: 932.15, orders: 5 },
  { id: 'c-103', name: 'Sofia Gomez', email: 'sofia@example.com', phone: '+1 212 315 7780', city: 'New York', totalSpent: 1540.2, orders: 9 }
];

const orders = [
  { id: 'o-1001', orderNumber: '#1001', customerId: 'c-101', customerName: 'Alicia Morgan', total: 499.98, subtotal: 449.99, shipping: 18.99, tax: 31.0, status: 'Processing', paymentMethod: 'Card', createdAt: '2026-09-22T10:30:00.000Z' },
  { id: 'o-1002', orderNumber: '#1002', customerId: 'c-102', customerName: 'Noah Patel', total: 189.5, subtotal: 169.5, shipping: 12.0, tax: 8.0, status: 'Shipped', paymentMethod: 'PayPal', createdAt: '2026-09-24T15:20:00.000Z' },
  { id: 'o-1003', orderNumber: '#1003', customerId: 'c-103', customerName: 'Sofia Gomez', total: 1139.0, subtotal: 1020.0, shipping: 18.0, tax: 101.0, status: 'Completed', paymentMethod: 'Card', createdAt: '2026-09-25T09:15:00.000Z' }
];

const settings = {
  storeName: 'Northstar Commerce',
  email: 'support@northstarcommerce.com',
  currency: 'USD',
  taxRate: 8.5,
  shippingFee: 12,
  timezone: 'UTC',
  logo: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'
};

const activities = [
  { id: 'a-1', type: 'Order', message: 'Order #1003 was completed successfully.', createdAt: '2026-09-25T09:15:00.000Z' },
  { id: 'a-2', type: 'Inventory', message: 'Smartwatch Pro X stock was updated.', createdAt: '2026-09-24T15:50:00.000Z' },
  { id: 'a-3', type: 'Customer', message: 'New customer Alicia Morgan was added.', createdAt: '2026-09-22T11:00:00.000Z' }
];

const createToken = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized. Please sign in.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ecommerce admin API running.' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  if (email === adminUser.email && password === adminUser.password) {
    const token = createToken(adminUser);
    return res.json({
      token,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  }

  return res.status(401).json({ message: 'Invalid email or password.' });
});

app.get('/api/dashboard', authMiddleware, (req, res) => {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const activeProducts = products.filter((product) => product.status === 'active').length;
  const lowStock = products.filter((product) => product.stock < 15).length;

  res.json({
    stats: {
      revenue: totalRevenue,
      orders: totalOrders,
      customers: customers.length,
      products: products.length,
      activeProducts,
      lowStock
    },
    recentOrders: orders.slice(0, 5),
    topProducts: products.slice(0, 3).map((product) => ({
      name: product.name,
      sales: Math.max(12, Math.round((product.stock / 5) * 10)),
      revenue: product.price * Math.max(12, Math.round((product.stock / 5) * 10))
    })),
    activity: activities
  });
});

app.get('/api/products', authMiddleware, (req, res) => {
  res.json(products);
});

app.post('/api/products', authMiddleware, (req, res) => {
  const { name, description, price, cost, stock, category, image, sku } = req.body;

  if (!name || !price || !sku) {
    return res.status(400).json({ message: 'Name, sku, and price are required.' });
  }

  const newProduct = {
    id: `p-${Date.now()}`,
    sku,
    name,
    description: description || 'New product listing',
    price: Number(price),
    cost: Number(cost || 0),
    stock: Number(stock || 0),
    category: category || 'General',
    status: 'active',
    image: image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'
  };

  products.unshift(newProduct);
  activities.unshift({ id: `a-${Date.now()}`, type: 'Product', message: `${name} was added to catalog.`, createdAt: new Date().toISOString() });

  res.status(201).json(newProduct);
});

app.put('/api/products/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const productIndex = products.findIndex((product) => product.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  products[productIndex] = {
    ...products[productIndex],
    ...req.body,
    price: Number(req.body.price || products[productIndex].price),
    cost: Number(req.body.cost || products[productIndex].cost),
    stock: Number(req.body.stock || products[productIndex].stock)
  };

  res.json(products[productIndex]);
});

app.delete('/api/products/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const index = products.findIndex((product) => product.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const deleted = products.splice(index, 1)[0];
  activities.unshift({ id: `a-${Date.now()}`, type: 'Product', message: `${deleted.name} was removed from catalog.`, createdAt: new Date().toISOString() });

  res.json({ success: true, message: 'Product deleted successfully.' });
});

app.get('/api/orders', authMiddleware, (req, res) => {
  res.json(orders);
});

app.patch('/api/orders/:id/status', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const orderIndex = orders.findIndex((order) => order.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  orders[orderIndex].status = status;
  activities.unshift({ id: `a-${Date.now()}`, type: 'Order', message: `Order ${orders[orderIndex].orderNumber} status updated to ${status}.`, createdAt: new Date().toISOString() });

  res.json(orders[orderIndex]);
});

app.get('/api/customers', authMiddleware, (req, res) => {
  res.json(customers);
});

app.get('/api/reports', authMiddleware, (req, res) => {
  const monthlyRevenue = [
    { month: 'Jan', revenue: 18200 },
    { month: 'Feb', revenue: 22100 },
    { month: 'Mar', revenue: 19800 },
    { month: 'Apr', revenue: 27000 },
    { month: 'May', revenue: 24450 },
    { month: 'Jun', revenue: 31800 }
  ];

  const salesByChannel = [
    { channel: 'Website', value: 43 },
    { channel: 'Marketplace', value: 31 },
    { channel: 'Social', value: 17 },
    { channel: 'Direct', value: 9 }
  ];

  res.json({ monthlyRevenue, salesByChannel, performance: { conversionRate: 4.8, averageOrderValue: 289.45, repeatPurchaseRate: 31 } });
});

app.get('/api/settings', authMiddleware, (req, res) => {
  res.json(settings);
});

app.put('/api/settings', authMiddleware, (req, res) => {
  Object.assign(settings, req.body);
  activities.unshift({ id: `a-${Date.now()}`, type: 'Settings', message: 'Store settings were updated.', createdAt: new Date().toISOString() });
  res.json(settings);
});

app.listen(PORT, () => {
  console.log(`Ecommerce admin API running on http://localhost:${PORT}`);
});
