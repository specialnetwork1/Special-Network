import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Ticket, 
  Settings, 
  LogOut, 
  Plus, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  CreditCard,
  Wifi,
  AlertCircle,
  Menu,
  X,
  ChevronRight,
  Terminal,
  Calendar,
  Copy
} from 'lucide-react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate, 
  Navigate 
} from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Contexts ---
const AuthContext = createContext<{ user: any, login: (u: string, p: string) => Promise<boolean>, logout: () => void, updateUser: (u: any) => void } | any>(null);
const MikrotikContext = createContext<any>(null);
const CompanyContext = createContext<any>(null);

const useAuth = () => useContext(AuthContext);
const useMikrotik = () => useContext(MikrotikContext);
const useCompany = () => useContext(CompanyContext);

// --- Components ---

const Card = ({ children, className, ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
  <div className={cn("bg-white rounded-2xl border border-black/5 shadow-sm p-6", className)} {...props}>
    {children}
  </div>
);

const Button = ({ children, className, variant = 'primary', ...props }: any) => {
  const variants = {
    primary: "bg-black text-white hover:bg-black/90",
    secondary: "bg-white text-black border border-black/10 hover:bg-gray-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100"
  };
  return (
    <button 
      className={cn("px-4 py-2 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2", variants[variant as keyof typeof variants], className)}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ label, ...props }: any) => (
  <div className="space-y-1.5">
    {label && <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</label>}
    <input 
      className="w-full px-4 py-2.5 bg-gray-50 border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
      {...props}
    />
  </div>
);

// --- Pages ---

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wifi className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">ISP Manager Pro</h1>
            <p className="text-gray-500 text-sm">Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Username" 
              placeholder="admin or customer_username" 
              value={username}
              onChange={(e: any) => setUsername(e.target.value)}
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
            />
            <Button className="w-full py-3 mt-4">Login</Button>
          </form>
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700 space-y-2">
            <p className="font-bold">Access Guide:</p>
            <p>• <strong>Admin:</strong> Use <code>admin</code> / <code>admin123</code></p>
            <p>• <strong>User Portal:</strong> Create a user in the Admin panel first, then login with those credentials here.</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const { status, refresh } = useMikrotik();

  useEffect(() => {
    fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()).then(setStats);
  }, []);

  const data = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
  ];

  const handleReboot = async () => {
    if (confirm("Are you sure you want to reboot the MikroTik router?")) {
      const res = await fetch('/api/mikrotik/reboot', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) alert("Reboot command sent to MikroTik.");
    }
  };

  const handleSync = async () => {
    const res = await fetch('/api/mikrotik/sync', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) alert("Synchronized with MikroTik PPPoE secrets.");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Overview</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.location.href = '/port-forwarding'}>
            <Terminal size={18} /> Port Forwarding
          </Button>
          <Button variant="secondary" onClick={handleSync}>
            <Wifi size={18} /> Sync Users
          </Button>
          <Button variant="danger" onClick={handleReboot}>
            <AlertCircle size={18} /> Reboot Router
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Users</p>
            <p className="text-2xl font-bold">{stats?.totalUsers}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Active</p>
            <p className="text-2xl font-bold">{stats?.activeUsers}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Due Bills</p>
            <p className="text-2xl font-bold">{stats?.dueBills}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Revenue</p>
            <p className="text-2xl font-bold">৳{stats?.revenue}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold mb-6">Revenue Overview</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#000" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Wifi size={20} /> MikroTik Status
          </h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-black/5">
              <span className="text-gray-500">Connection</span>
              <div className="text-right">
                <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase", status?.connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                  {status?.connected ? "Online" : "Offline"}
                </span>
                {status?.isSimulation && status?.connected && (
                  <p className="text-[9px] text-blue-500 font-bold uppercase mt-1">Simulated</p>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Host IP</span>
              <span className="font-mono text-xs">{status?.host || 'Not Set'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Active PPPoE</span>
              <span className="font-bold">{status?.active_pppoe || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">CPU Load</span>
              <span className="font-bold">{status?.cpu_load || '0%'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Uptime</span>
              <span className="font-bold text-sm">{status?.uptime || 'N/A'}</span>
            </div>
            <div className="pt-4 space-y-2">
              <Button variant="secondary" className="w-full" onClick={refresh}>
                Refresh Status
              </Button>
              <p className="text-[10px] text-center text-gray-400">
                {status?.connected 
                  ? "Last checked: " + new Date().toLocaleTimeString() 
                  : "Check your IP and API settings"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    phone: '',
    package_name: '',
    monthly_fee: ''
  });

  const fetchUsers = () => {
    fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()).then(setUsers);
  };

  const fetchPackages = () => {
    fetch('/api/packages', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()).then(setPackages);
  };

  useEffect(() => {
    fetchUsers();
    fetchPackages();
  }, []);

  const handlePackageChange = (packageName: string) => {
    const pkg = packages.find(p => p.name === packageName);
    setFormData({
      ...formData,
      package_name: packageName,
      monthly_fee: pkg ? pkg.price.toString() : formData.monthly_fee
    });
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      full_name: '',
      phone: '',
      package_name: '',
      monthly_fee: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      full_name: user.full_name,
      phone: user.phone || '',
      package_name: user.package_name || '',
      monthly_fee: user.monthly_fee?.toString() || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
    const method = editingUser ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setShowModal(false);
      fetchUsers();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to save user");
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user? This will also delete their bills and tickets.")) return;
    
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (res.ok) {
      fetchUsers();
    }
  };

  const toggleUserStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const res = await fetch('/api/users/toggle-status', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: user.id, status: newStatus })
    });
    if (res.ok) {
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button onClick={handleOpenAdd}><Plus size={20} /> Add User</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-black/5 flex items-center gap-3">
          <Search size={20} className="text-gray-400" />
          <input 
            placeholder="Search users..." 
            className="flex-1 bg-transparent outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-500 tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">PPPoE ID</th>
                <th className="px-6 py-4">Password</th>
                <th className="px-6 py-4">Package</th>
                <th className="px-6 py-4">Fee</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{user.full_name}</td>
                  <td className="px-6 py-4 text-gray-500">{user.username}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{user.password}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                      {user.package_name || '5 Mbps'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">৳{user.monthly_fee || 500}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "flex items-center gap-1.5 text-xs font-bold uppercase",
                      user.status === 'active' ? "text-green-600" : "text-red-600"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", user.status === 'active' ? "bg-green-600" : "bg-red-600")} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <Button 
                      variant="secondary" 
                      className={cn("text-[10px] py-1 px-2", user.status === 'active' ? "text-red-500" : "text-green-500")}
                      onClick={() => toggleUserStatus(user)}
                    >
                      {user.status === 'active' ? 'Disable' : 'Enable'}
                    </Button>
                    <Button variant="ghost" className="text-xs" onClick={() => handleOpenEdit(user)}>Edit</Button>
                    <button onClick={() => deleteUser(user.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <XCircle size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg"
            >
              <Card className="p-8">
                <h3 className="text-xl font-bold mb-6">{editingUser ? 'Edit Subscriber' : 'Add New Subscriber'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="Full Name" 
                      value={formData.full_name} 
                      onChange={(e: any) => setFormData({...formData, full_name: e.target.value})}
                      required
                    />
                    <Input 
                      label="PPPoE ID" 
                      value={formData.username} 
                      onChange={(e: any) => setFormData({...formData, username: e.target.value})}
                      required
                    />
                    <Input 
                      label="PPPoE Password" 
                      type="text" 
                      value={formData.password} 
                      onChange={(e: any) => setFormData({...formData, password: e.target.value})}
                      placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
                      required={!editingUser}
                    />
                    <Input 
                      label="Phone" 
                      value={formData.phone} 
                      onChange={(e: any) => setFormData({...formData, phone: e.target.value})}
                    />
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Package</label>
                      <select 
                        className="w-full px-4 py-2.5 bg-gray-50 border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                        value={formData.package_name}
                        onChange={(e) => handlePackageChange(e.target.value)}
                        required
                      >
                        <option value="">Select Package</option>
                        {packages.map(pkg => (
                          <option key={pkg.id} value={pkg.name}>{pkg.name} (৳{pkg.price})</option>
                        ))}
                      </select>
                    </div>
                    <Input 
                      label="Monthly Fee" 
                      type="number"
                      value={formData.monthly_fee} 
                      onChange={(e: any) => setFormData({...formData, monthly_fee: e.target.value})}
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">{editingUser ? 'Update User' : 'Create User'}</Button>
                    <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomerPortal = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [payingBill, setPayingBill] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | null>(null);
  const [paymentStep, setPaymentStep] = useState<'method' | 'details' | 'processing' | 'success'>('method');
  const [gatewaySettings, setGatewaySettings] = useState<any>({});
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalDue = bills
    .filter(b => b.status === 'unpaid')
    .reduce((sum, b) => sum + b.amount, 0);

  const lastPaidBill = [...bills]
    .filter(b => b.status === 'paid')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  useEffect(() => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    fetch('/api/bills', { headers }).then(res => res.json()).then(setBills);
    fetch('/api/tickets', { headers }).then(res => res.json()).then(setTickets);
    fetch('/api/settings', { headers }).then(res => res.json()).then(setGatewaySettings);
  }, []);

  const generateInvoice = (bill: any) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("ISP Manager Pro - INVOICE", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Invoice ID: INV-${bill.id}`, 20, 40);
    doc.text(`Date: ${new Date(bill.created_at).toLocaleDateString()}`, 20, 45);
    doc.text(`Customer: ${user.full_name}`, 20, 50);
    
    autoTable(doc, {
      startY: 60,
      head: [['Description', 'Month', 'Amount']],
      body: [
        ['Internet Service Subscription', bill.month, `৳${bill.amount}`]
      ],
    });
    
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.text(`Total Paid: ৳${bill.amount}`, 150, finalY + 20);
    doc.save(`invoice-${bill.id}.pdf`);
  };

  const handlePay = (method: 'bKash' | 'Nagad' | 'Rocket') => {
    setPaymentMethod(method);
    setPaymentStep('details');
  };

  const handleConfirmPayment = async () => {
    if (!transactionId.trim()) {
      alert("Please enter your Transaction ID");
      return;
    }

    setIsSubmitting(true);
    setPaymentStep('processing');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const headers = { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    };
    
    try {
      const res = await fetch('/api/bills/pay', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          bill_id: payingBill.id, 
          payment_method: paymentMethod, 
          transaction_id: transactionId.trim()
        })
      });

      if (res.ok) {
        setPaymentStep('success');
        // Refresh bills
        fetch('/api/bills', { headers }).then(res => res.json()).then(setBills);
        setTimeout(() => {
          setPayingBill(null);
          setPaymentStep('method');
          setTransactionId('');
          setIsSubmitting(false);
        }, 3000);
      } else {
        const data = await res.json();
        alert(data.error || "Payment failed");
        setPaymentStep('details');
        setIsSubmitting(false);
      }
    } catch (e) {
      alert("An error occurred during payment");
      setPaymentStep('details');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user.full_name}</h1>
          <p className="text-gray-500">Manage your internet subscription</p>
        </div>
        <div className="px-4 py-2 bg-green-50 text-green-700 rounded-2xl border border-green-100 flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span className="font-bold text-sm uppercase">Active Subscription</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black text-white">
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Current Package</p>
          <h2 className="text-3xl font-bold mb-4">{user.package_name || 'Not Set'}</h2>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/60 text-xs">Monthly Fee</p>
              <p className="font-bold">৳{user.monthly_fee || 0}</p>
            </div>
            <Button variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs">Upgrade</Button>
          </div>
        </Card>
        
        <Card className="flex flex-col justify-center bg-red-50 border-red-100">
          <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-2">Total Due Amount</p>
          <h2 className="text-3xl font-bold mb-1 text-red-700">৳{totalDue.toFixed(2)}</h2>
          <p className="text-red-600 text-xs font-medium">
            {bills.filter(b => b.status === 'unpaid').length} unpaid bills
          </p>
        </Card>

        <Card className="flex flex-col justify-center">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Last Payment</p>
          <h2 className="text-3xl font-bold mb-1">৳{lastPaidBill?.amount.toFixed(2) || '0.00'}</h2>
          {lastPaidBill ? (
            <p className="text-green-600 text-sm font-medium flex items-center gap-1">
              <CheckCircle2 size={14} /> Paid via {lastPaidBill.payment_method}
            </p>
          ) : (
            <p className="text-gray-400 text-sm font-medium">No recent payments</p>
          )}
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Billing History</h3>
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-500 tracking-wider">
              <tr>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {bills.map(bill => (
                <tr key={bill.id}>
                  <td className="px-6 py-4 font-medium">{bill.month}</td>
                  <td className="px-6 py-4">৳{bill.amount}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                      bill.status === 'paid' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    {bill.status === 'unpaid' && (
                      <Button variant="primary" className="text-xs py-1 px-3" onClick={() => setPayingBill(bill)}>
                        Pay Now
                      </Button>
                    )}
                    <button 
                      onClick={() => generateInvoice(bill)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                    >
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No billing records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Support Tickets</h3>
          <Button variant="secondary" className="text-sm" onClick={() => {}}><Plus size={16} /> Open Ticket</Button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {tickets.map(ticket => (
            <Card key={ticket.id} className="flex justify-between items-center">
              <div>
                <h4 className="font-bold">{ticket.subject}</h4>
                <p className="text-sm text-gray-500">{ticket.message}</p>
              </div>
              <span className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                ticket.status === 'open' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
              )}>
                {ticket.status}
              </span>
            </Card>
          ))}
          {tickets.length === 0 && (
            <Card className="text-center py-12 text-gray-400">No support tickets found</Card>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {payingBill && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md"
            >
              <Card className="p-0 overflow-hidden border-none shadow-2xl">
                {paymentStep === 'method' && (
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-bold">Checkout</h3>
                        <p className="text-gray-500 text-sm">Select your preferred payment method</p>
                        <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <p className="text-xs text-blue-600 font-bold uppercase">Amount to Pay</p>
                          <p className="text-2xl font-bold text-blue-700">৳{payingBill.amount}</p>
                          <p className="text-xs text-blue-500">For {payingBill.month}</p>
                        </div>
                      </div>
                      <button onClick={() => setPayingBill(null)} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl mb-6 flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Total Amount</span>
                      <span className="text-2xl font-bold">৳{payingBill.amount}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={() => handlePay('bKash')}
                        className="flex items-center justify-between p-4 rounded-xl border-2 border-transparent hover:border-[#D12053] bg-[#D12053]/5 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#D12053] rounded-lg flex items-center justify-center text-white font-bold text-xl">b</div>
                          <div className="text-left">
                            <p className="font-bold text-[#D12053]">bKash</p>
                            <p className="text-xs text-gray-500">
                              {gatewaySettings.bkash_number ? `Send to: ${gatewaySettings.bkash_number}` : 'Pay using bKash account'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="text-[#D12053] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>

                      <button 
                        onClick={() => handlePay('Nagad')}
                        className="flex items-center justify-between p-4 rounded-xl border-2 border-transparent hover:border-[#F7941D] bg-[#F7941D]/5 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#F7941D] rounded-lg flex items-center justify-center text-white font-bold text-xl">n</div>
                          <div className="text-left">
                            <p className="font-bold text-[#F7941D]">Nagad</p>
                            <p className="text-xs text-gray-500">
                              {gatewaySettings.nagad_number ? `Send to: ${gatewaySettings.nagad_number}` : 'Pay using Nagad account'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="text-[#F7941D] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>

                      <button 
                        onClick={() => handlePay('Rocket')}
                        className="flex items-center justify-between p-4 rounded-xl border-2 border-transparent hover:border-[#8C3494] bg-[#8C3494]/5 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#8C3494] rounded-lg flex items-center justify-center text-white font-bold text-xl">r</div>
                          <div className="text-left">
                            <p className="font-bold text-[#8C3494]">Rocket</p>
                            <p className="text-xs text-gray-500">
                              {gatewaySettings.rocket_number ? `Send to: ${gatewaySettings.rocket_number}` : 'Pay using Rocket account'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="text-[#8C3494] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </div>
                )}

                {paymentStep === 'details' && (
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold">Payment Details</h3>
                        <p className="text-gray-500 text-sm">Follow the instructions below</p>
                      </div>
                      <button onClick={() => setPaymentStep('method')} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronRight className="rotate-180" size={20} />
                      </button>
                    </div>

                    <div className={cn(
                      "p-6 rounded-2xl border-2 space-y-4",
                      paymentMethod === 'bKash' ? "bg-[#D12053]/5 border-[#D12053]/20" : 
                      paymentMethod === 'Nagad' ? "bg-[#F7941D]/5 border-[#F7941D]/20" :
                      "bg-[#8C3494]/5 border-[#8C3494]/20"
                    )}>
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl",
                          paymentMethod === 'bKash' ? "bg-[#D12053]" : 
                          paymentMethod === 'Nagad' ? "bg-[#F7941D]" :
                          "bg-[#8C3494]"
                        )}>
                          {paymentMethod === 'bKash' ? 'b' : paymentMethod === 'Nagad' ? 'n' : 'r'}
                        </div>
                        <div>
                          <p className={cn("font-bold text-lg", 
                            paymentMethod === 'bKash' ? "text-[#D12053]" : 
                            paymentMethod === 'Nagad' ? "text-[#F7941D]" :
                            "text-[#8C3494]"
                          )}>
                            {paymentMethod} Personal
                          </p>
                          <p className="text-sm font-mono font-bold text-gray-700">
                            {paymentMethod === 'bKash' 
                              ? (gatewaySettings.bkash_number || 'Number not set by admin') 
                              : paymentMethod === 'Nagad'
                              ? (gatewaySettings.nagad_number || 'Number not set by admin')
                              : (gatewaySettings.rocket_number || 'Number not set by admin')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>1. Go to your {paymentMethod} app or dial USSD</p>
                        <p>2. Choose <strong>Send Money</strong> option</p>
                        <p>3. Enter the number above and amount <strong>৳{payingBill.amount}</strong></p>
                        <p>4. After successful transfer, enter the <strong>Transaction ID</strong> below</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Input 
                        label="Transaction ID" 
                        placeholder="e.g. 8N7A6D5C4B" 
                        value={transactionId}
                        onChange={(e: any) => setTransactionId(e.target.value.toUpperCase())}
                      />
                      <Button className="w-full py-4 text-lg" onClick={handleConfirmPayment} disabled={isSubmitting}>
                        {isSubmitting ? "Verifying..." : "Confirm Payment"}
                      </Button>
                    </div>
                  </div>
                )}

                {paymentStep === 'processing' && (
                  <div className="p-12 text-center space-y-6">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className={cn(
                        "absolute inset-0 rounded-full border-4 border-t-transparent animate-spin",
                        paymentMethod === 'bKash' ? "border-[#D12053]" : 
                        paymentMethod === 'Nagad' ? "border-[#F7941D]" :
                        "border-[#8C3494]"
                      )}></div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Processing Payment</h3>
                      <p className="text-gray-500">Please wait while we confirm your transaction with {paymentMethod}...</p>
                    </div>
                  </div>
                )}

                {paymentStep === 'success' && (
                  <div className="p-12 text-center space-y-6 bg-green-50">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-lg shadow-green-200">
                      <CheckCircle2 size={40} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-green-800">Payment Successful!</h3>
                      <p className="text-green-600">Your bill for {payingBill.month} has been paid.</p>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PortForwardingTool = () => {
  const [formData, setFormData] = useState({
    description: '',
    internalHost: '',
    protocol: 'tcp',
    externalPort: '',
    internalPort: ''
  });
  const [days, setDays] = useState(30);
  const [copied, setCopied] = useState(false);
  const [savedRules, setSavedRules] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSavedRules = async () => {
    try {
      const res = await fetch('/api/port-forwarding', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedRules(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchSavedRules();
  }, []);

  const calculateExpiry = () => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };

  const expiryDate = calculateExpiry();
  const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const formattedExpiry = `${monthNames[expiryDate.getMonth()]}/${expiryDate.getDate().toString().padStart(2, '0')}/${expiryDate.getFullYear()}`;

  const handleSave = async () => {
    if (!formData.description || !formData.internalHost || !formData.externalPort) {
      alert("Please fill in the basic details first.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/port-forwarding', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          validity_days: days,
          expiry_date: expiryDate.toISOString()
        })
      });
      if (res.ok) {
        alert("Configuration saved successfully!");
        fetchSavedRules();
      }
    } catch (e) {
      alert("Failed to save configuration.");
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this saved configuration?")) return;
    try {
      const res = await fetch(`/api/port-forwarding/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchSavedRules();
      }
    } catch (e) {}
  };

  const mikrotikCommand = `/ip firewall nat
add chain=dstnat action=dst-nat \\
    to-addresses=${formData.internalHost || '192.168.88.10'} \\
    to-ports=${formData.internalPort || formData.externalPort || '80'} \\
    protocol=${formData.protocol} \\
    dst-port=${formData.externalPort || '80'} \\
    comment="${formData.description || 'Port Forward Rule'}"`;

  const schedulerCommand = `/system scheduler
add name="Disable_${formData.description.replace(/\s+/g, '_') || 'Rule'}" \\
    start-date=${formattedExpiry} \\
    start-time=00:00:00 \\
    on-event={/ip firewall nat disable [find comment="${formData.description || 'Port Forward Rule'}"]}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Port Forwarding & Billing Tool</h2>
          <p className="text-gray-500">Generate MikroTik NAT rules and automated expiry schedulers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 space-y-6">
          <h3 className="font-bold flex items-center gap-2 text-lg">
            <Settings size={20} /> Configuration
          </h3>
          <div className="space-y-4">
            <Input 
              label="Description" 
              placeholder="e.g. Web Server" 
              value={formData.description}
              onChange={(e: any) => setFormData({...formData, description: e.target.value})}
            />
            <Input 
              label="Internal Host Address" 
              placeholder="e.g. 192.168.88.10" 
              value={formData.internalHost}
              onChange={(e: any) => setFormData({...formData, internalHost: e.target.value})}
            />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Protocol</label>
              <select 
                className="w-full px-4 py-2.5 bg-gray-50 border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                value={formData.protocol}
                onChange={(e) => setFormData({...formData, protocol: e.target.value})}
              >
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="External Port" 
                placeholder="80" 
                value={formData.externalPort}
                onChange={(e: any) => setFormData({...formData, externalPort: e.target.value})}
              />
              <Input 
                label="Internal Port" 
                placeholder="80" 
                value={formData.internalPort}
                onChange={(e: any) => setFormData({...formData, internalPort: e.target.value})}
              />
            </div>
            <div className="pt-4 border-t border-black/5">
              <Input 
                label="Validity (Days)" 
                type="number"
                value={days}
                onChange={(e: any) => setDays(parseInt(e.target.value) || 0)}
              />
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <Calendar size={16} />
                  <span className="text-xs font-bold uppercase">Expiry Date</span>
                </div>
                <p className="text-lg font-bold text-blue-900">{expiryDate.toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="text-[10px] text-blue-600 font-medium mt-1">Calculated from today ({days} days)</p>
              </div>
            </div>
            <Button className="w-full py-3" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2 text-lg">
                <Terminal size={20} /> MikroTik NAT Rule
              </h3>
              <Button variant="secondary" className="py-1.5 px-3 text-xs" onClick={() => copyToClipboard(mikrotikCommand)}>
                <Copy size={14} /> {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
              <pre className="text-emerald-400 font-mono text-xs leading-relaxed">
                {mikrotikCommand}
              </pre>
            </div>
            <p className="text-[10px] text-gray-400">Copy and paste this command into your MikroTik Terminal.</p>
          </Card>

          <Card className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2 text-lg">
                <Clock size={20} /> Expiry Scheduler
              </h3>
              <Button variant="secondary" className="py-1.5 px-3 text-xs" onClick={() => copyToClipboard(schedulerCommand)}>
                <Copy size={14} /> Copy
              </Button>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
              <pre className="text-blue-400 font-mono text-xs leading-relaxed">
                {schedulerCommand}
              </pre>
            </div>
            <p className="text-[10px] text-gray-400">This will automatically disable the rule on the expiry date.</p>
          </Card>

          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-4">
            <div className="p-2 bg-emerald-500 rounded-lg text-white">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 className="font-bold text-emerald-900">Pro Tip</h4>
              <p className="text-sm text-emerald-700 leading-relaxed">
                Always ensure your <strong>Internal Host Address</strong> is static or reserved in DHCP. 
                If the internal IP changes, the port forwarding will stop working.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Saved Port Forwarding Rules</h3>
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Internal Host</th>
                  <th className="px-6 py-4">Ports (Ext/Int)</th>
                  <th className="px-6 py-4">Protocol</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {savedRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm">{rule.description}</td>
                    <td className="px-6 py-4 text-sm font-mono">{rule.internal_host}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                        {rule.external_port} → {rule.internal_port}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">
                        {rule.protocol}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">
                        {new Date(rule.expiry_date).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {Math.ceil((new Date(rule.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="secondary" 
                          className="py-1 px-2 text-[10px]"
                          onClick={() => {
                            setFormData({
                              description: rule.description,
                              internalHost: rule.internal_host,
                              protocol: rule.protocol,
                              externalPort: rule.external_port,
                              internalPort: rule.internal_port
                            });
                            setDays(rule.validity_days);
                          }}
                        >
                          Load
                        </Button>
                        <button 
                          onClick={() => handleDelete(rule.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {savedRules.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No saved configurations found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Layout ---

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { status } = useMikrotik();
  const { company } = useCompany();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = user?.role === 'admin' ? [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Subscribers', path: '/users' },
    { icon: Receipt, label: 'Billing', path: '/billing' },
    { icon: Ticket, label: 'Support', path: '/tickets' },
    { icon: Terminal, label: 'Port Forward', path: '/port-forwarding' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ] : [
    { icon: LayoutDashboard, label: 'My Portal', path: '/' },
    { icon: Receipt, label: 'My Bills', path: '/billing' },
    { icon: Ticket, label: 'Support', path: '/tickets' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const NavContent = () => (
    <>
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center overflow-hidden">
          {company?.company_logo ? (
            <img src={company.company_logo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <Wifi size={20} className="text-white" />
          )}
        </div>
        <span className="font-bold text-lg truncate">{company?.company_name || "ISP Manager"}</span>
      </div>
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
              window.location.pathname === item.path 
                ? "bg-black text-white" 
                : "text-gray-500 hover:text-black hover:bg-gray-50"
            )}
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-black/5 space-y-2">
        <div className="px-4 py-3 bg-gray-50 rounded-xl">
          <p className="text-xs font-bold text-gray-400 uppercase">Logged in as</p>
          <p className="font-bold text-sm truncate">{user.full_name}</p>
          <p className="text-[10px] text-gray-500 uppercase font-medium">{user.role}</p>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white border-r border-black/5 flex flex-col hidden md:flex sticky top-0 h-screen">
        <NavContent />
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.aside 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="absolute top-0 left-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col"
            >
              <NavContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:block">
              <Wifi size={24} />
            </div>
            {user?.role === 'admin' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-black/5 rounded-full">
                <div className={cn("w-2 h-2 rounded-full", status?.connected ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hidden sm:inline">
                  MikroTik: {status?.connected ? "Connected" : "Disconnected"}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 sm:hidden">
                  {status?.connected ? "Online" : "Offline"}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">{user?.full_name}</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{user?.role}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-black/5">
              <Users size={20} className="text-gray-500" />
            </div>
          </div>
        </header>
        <div className="p-4 md:p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={window.location.pathname}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

const BillingManagement = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [reminding, setReminding] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [manualBill, setManualBill] = useState({
    user_id: '',
    month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    amount: ''
  });

  const fetchBills = () => {
    fetch('/api/bills', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()).then(setBills);
  };

  const fetchUsers = () => {
    fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()).then(setUsers);
  };

  useEffect(() => {
    fetchBills();
    fetchUsers();
  }, []);

  const generateMonthlyBills = async () => {
    setGenerating(true);
    setMessage(null);
    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    try {
      const res = await fetch('/api/admin/generate-bills', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ month })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: `Successfully generated ${data.count} new bills for ${month}.`, type: 'success' });
        fetchBills();
      }
    } catch (e) {
      setMessage({ text: "Failed to generate bills.", type: 'error' });
    }
    setGenerating(false);
  };

  const handleCreateManualBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBill.user_id || !manualBill.amount) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch('/api/admin/create-bill', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(manualBill)
      });
      if (res.ok) {
        setMessage({ text: "Manual bill created successfully!", type: 'success' });
        setShowManualModal(false);
        fetchBills();
        setManualBill({
          user_id: '',
          month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
          amount: ''
        });
      }
    } catch (e) {
      setMessage({ text: "Failed to create manual bill.", type: 'error' });
    }
  };

  const sendReminders = async () => {
    setReminding(true);
    setMessage(null);
    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    try {
      const res = await fetch('/api/admin/send-reminders', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ month })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: `Successfully sent ${data.count} payment reminders for ${month}.`, type: 'success' });
      }
    } catch (e) {
      setMessage({ text: "Failed to send reminders.", type: 'error' });
    }
    setReminding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Billing Management</h2>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowManualModal(true)}>
            <Plus size={18} /> Create Manual Bill
          </Button>
          <Button variant="secondary" onClick={sendReminders} disabled={reminding}>
            {reminding ? "Sending..." : "Send Reminders"}
          </Button>
          <Button onClick={generateMonthlyBills} disabled={generating}>
            {generating ? "Generating..." : "Generate Monthly Bills"}
          </Button>
        </div>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-xl flex items-center gap-3",
            message.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
          )}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{message.text}</span>
        </motion.div>
      )}

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-500 tracking-wider">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Month</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">TrxID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {bills.map(bill => (
              <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-sm">{bill.user_name}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{bill.user_phone || 'N/A'}</td>
                <td className="px-6 py-4 text-sm">{bill.month}</td>
                <td className="px-6 py-4 font-bold">৳{bill.amount}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                    bill.status === 'paid' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {bill.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {bill.payment_method ? (
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-bold uppercase text-white",
                      bill.payment_method === 'bKash' ? "bg-[#D12053]" : 
                      bill.payment_method === 'Nagad' ? "bg-[#F7941D]" : "bg-[#8C3494]"
                    )}>
                      {bill.payment_method}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 font-mono text-[10px] text-gray-500">{bill.transaction_id || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <AnimatePresence>
        {showManualModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
            >
              <Card className="p-8">
                <h3 className="text-xl font-bold mb-6">Create Manual Bill</h3>
                <form onSubmit={handleCreateManualBill} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Select Customer</label>
                    <select 
                      className="w-full p-3 bg-gray-50 border border-black/5 rounded-xl outline-none focus:ring-2 focus:ring-black/5 transition-all"
                      value={manualBill.user_id}
                      onChange={(e) => setManualBill({...manualBill, user_id: e.target.value})}
                      required
                    >
                      <option value="">Choose a customer...</option>
                      {users.filter(u => u.role === 'customer').map(u => (
                        <option key={u.id} value={u.id}>{u.full_name} ({u.username})</option>
                      ))}
                    </select>
                  </div>
                  <Input 
                    label="Month" 
                    value={manualBill.month} 
                    onChange={(e: any) => setManualBill({...manualBill, month: e.target.value})}
                    required
                  />
                  <Input 
                    label="Amount" 
                    type="number"
                    value={manualBill.amount} 
                    onChange={(e: any) => setManualBill({...manualBill, amount: e.target.value})}
                    required
                  />
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">Create Bill</Button>
                    <Button type="button" variant="secondary" onClick={() => setShowManualModal(false)}>Cancel</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const { refresh: refreshCompany } = useCompany();
  const [settings, setSettings] = useState<any>({
    mikrotik_host: '',
    mikrotik_port: '8728',
    mikrotik_user: '',
    mikrotik_password: '',
    bkash_number: '',
    nagad_number: '',
    rocket_number: '',
    company_name: '',
    company_logo: ''
  });
  const [packages, setPackages] = useState<any[]>([]);
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any>(null);
  const [pkgFormData, setPkgFormData] = useState({ name: '', price: '', speed: '' });

  const [profile, setProfile] = useState({
    full_name: user.full_name || '',
    address: user.address || '',
    phone: user.phone || '',
    password: ''
  });
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [testing, setTesting] = useState(false);
  const { refresh, status } = useMikrotik();

  const fetchPackages = () => {
    fetch('/api/packages', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()).then(setPackages);
  };

  useEffect(() => {
    if (user.role === 'admin') {
      fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setSettings((prev: any) => ({ ...prev, ...data }));
        }
      });
      fetchPackages();
    }
  }, [user.role]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert("Configuration saved successfully!");
        refreshCompany();
      }
    } catch (e) {
      alert("Failed to save settings.");
    }
    setSaving(false);
  };

  const handlePkgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingPkg ? `/api/packages/${editingPkg.id}` : '/api/packages';
    const method = editingPkg ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(pkgFormData)
    });
    if (res.ok) {
      fetchPackages();
      setShowPkgModal(false);
    }
  };

  const deletePackage = async (id: number) => {
    if (!confirm("Delete this package?")) return;
    const res = await fetch(`/api/packages/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) fetchPackages();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        alert("Profile updated successfully!");
        setProfile(prev => ({ ...prev, password: '' }));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update profile");
      }
    } catch (e) {
      alert("An error occurred");
    }
    setSavingProfile(false);
  };

  const handleTest = async () => {
    setTesting(true);
    const result = await refresh();
    setTesting(false);
    if (result?.connected) {
      alert("Connection Successful!");
    } else if (result?.isPrivate) {
      alert("Connection Failed: Private IP detected. Please use a Public IP or Tunnel.");
    } else {
      alert("Connection Failed: Could not reach the MikroTik host.");
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Account Settings</h2>
        {user.role === 'admin' && (
          <div className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-2",
            status?.connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            <div className={cn("w-2 h-2 rounded-full", status?.connected ? "bg-green-500" : "bg-red-500")} />
            {status?.connected ? "MikroTik Connected" : "MikroTik Disconnected"}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Section */}
        <div className="space-y-6">
          <Card className="space-y-6">
            <h3 className="font-bold flex items-center gap-2 text-lg"><Users size={20} /> My Profile</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Input 
                  label="Full Name" 
                  value={profile.full_name} 
                  onChange={(e: any) => setProfile({...profile, full_name: e.target.value})}
                  required
                />
                <Input 
                  label="Username" 
                  value={user.username} 
                  disabled
                  className="bg-gray-100 opacity-70"
                />
                <Input 
                  label="Phone Number" 
                  value={profile.phone} 
                  onChange={(e: any) => setProfile({...profile, phone: e.target.value})}
                  placeholder="017XXXXXXXX"
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Address</label>
                  <textarea 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all min-h-[100px]"
                    value={profile.address}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    placeholder="Enter your full address"
                  />
                </div>
                <Input 
                  label="New Password (Optional)" 
                  type="password" 
                  value={profile.password} 
                  onChange={(e: any) => setProfile({...profile, password: e.target.value})}
                  placeholder="Leave blank to keep current"
                />
              </div>
              
              {user.role === 'customer' && (
                <div className="p-4 bg-gray-50 rounded-xl border border-black/5 space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase">Subscription Info</p>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Package:</span>
                    <span className="text-sm font-bold">{user.package_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly Fee:</span>
                    <span className="text-sm font-bold">৳{user.monthly_fee}</span>
                  </div>
                </div>
              )}

              <Button className="w-full" type="submit" disabled={savingProfile}>
                {savingProfile ? "Updating Profile..." : "Update Profile"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Admin Only Sections */}
        {user.role === 'admin' && (
          <div className="space-y-6">
            <Card className="space-y-6">
              <h3 className="font-bold flex items-center gap-2 text-lg"><LayoutDashboard size={20} /> Company Info</h3>
              <div className="space-y-4">
                <Input 
                  label="Company Name" 
                  value={settings.company_name || ''} 
                  onChange={(e: any) => setSettings({...settings, company_name: e.target.value})}
                />
                <Input 
                  label="Logo URL" 
                  value={settings.company_logo || ''} 
                  onChange={(e: any) => setSettings({...settings, company_logo: e.target.value})}
                />
              </div>
              <Button className="w-full" onClick={handleSaveSettings} disabled={saving}>Save Company Info</Button>
            </Card>

            <Card className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-lg"><Wifi size={20} /> Packages</h3>
                <Button variant="secondary" className="py-1 px-3 text-xs" onClick={() => {
                  setEditingPkg(null);
                  setPkgFormData({ name: '', price: '', speed: '' });
                  setShowPkgModal(true);
                }}>
                  <Plus size={14} /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {packages.map(pkg => (
                  <div key={pkg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-black/5">
                    <div>
                      <p className="font-bold text-sm">{pkg.name}</p>
                      <p className="text-xs text-gray-500">{pkg.speed} - ৳{pkg.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        setEditingPkg(pkg);
                        setPkgFormData({ name: pkg.name, price: pkg.price.toString(), speed: pkg.speed });
                        setShowPkgModal(true);
                      }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">
                        <Settings size={14} />
                      </button>
                      <button onClick={() => deletePackage(pkg.id)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-6">
              <h3 className="font-bold flex items-center gap-2 text-lg"><Wifi size={20} /> MikroTik Config</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Host IP" 
                  value={settings.mikrotik_host} 
                  onChange={(e: any) => setSettings({...settings, mikrotik_host: e.target.value})}
                />
                <Input 
                  label="Port" 
                  value={settings.mikrotik_port} 
                  onChange={(e: any) => setSettings({...settings, mikrotik_port: e.target.value})}
                />
                <Input 
                  label="User" 
                  value={settings.mikrotik_user} 
                  onChange={(e: any) => setSettings({...settings, mikrotik_user: e.target.value})}
                />
                <Input 
                  label="Pass" 
                  type="password" 
                  value={settings.mikrotik_password} 
                  onChange={(e: any) => setSettings({...settings, mikrotik_password: e.target.value})}
                />
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" onClick={handleSaveSettings} disabled={saving}>Save</Button>
                <Button variant="secondary" className="flex-1" onClick={handleTest} disabled={testing}>Test</Button>
              </div>
            </Card>

            <Card className="space-y-6">
              <h3 className="font-bold flex items-center gap-2 text-lg"><CreditCard size={20} /> Payment Numbers</h3>
              <div className="space-y-4">
                <Input 
                  label="bKash Personal" 
                  value={settings.bkash_number || ''} 
                  onChange={(e: any) => setSettings({...settings, bkash_number: e.target.value})}
                />
                <Input 
                  label="Nagad Personal" 
                  value={settings.nagad_number || ''} 
                  onChange={(e: any) => setSettings({...settings, nagad_number: e.target.value})}
                />
                <Input 
                  label="Rocket Personal" 
                  value={settings.rocket_number || ''} 
                  onChange={(e: any) => setSettings({...settings, rocket_number: e.target.value})}
                />
              </div>
              <Button className="w-full" onClick={handleSaveSettings} disabled={saving}>Save Payment Info</Button>
            </Card>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showPkgModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md">
              <Card className="p-8">
                <h3 className="text-xl font-bold mb-6">{editingPkg ? 'Edit Package' : 'Add Package'}</h3>
                <form onSubmit={handlePkgSubmit} className="space-y-4">
                  <Input label="Package Name" value={pkgFormData.name} onChange={(e: any) => setPkgFormData({...pkgFormData, name: e.target.value})} required />
                  <Input label="Price (৳)" type="number" value={pkgFormData.price} onChange={(e: any) => setPkgFormData({...pkgFormData, price: e.target.value})} required />
                  <Input label="Speed (e.g. 10M)" value={pkgFormData.speed} onChange={(e: any) => setPkgFormData({...pkgFormData, speed: e.target.value})} required />
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">{editingPkg ? 'Update' : 'Create'}</Button>
                    <Button type="button" variant="secondary" onClick={() => setShowPkgModal(false)}>Cancel</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- App Root ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mikrotikStatus, setMikrotikStatus] = useState<any>(null);
  const [companySettings, setCompanySettings] = useState<any>(null);

  const fetchCompanySettings = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCompanySettings(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchCompanySettings();
  }, [user]);

  const updateUser = (updatedUser: any) => {
    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const fetchMikrotikStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const res = await fetch('/api/mikrotik/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMikrotikStatus(data);
        return data;
      }
    } catch (e) {
      console.error(e);
      setMikrotikStatus({ connected: false });
    }
    return null;
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        fetchMikrotikStatus();
      } catch (e) {
        console.error("Failed to parse saved user", e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        fetchMikrotikStatus();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMikrotikStatus(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      <MikrotikContext.Provider value={{ status: mikrotikStatus, refresh: fetchMikrotikStatus }}>
        <CompanyContext.Provider value={{ company: companySettings, refresh: fetchCompanySettings }}>
          <Router>
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route path="/*" element={user ? (
                <Layout>
                  <Routes>
                    <Route path="/" element={user.role === 'admin' ? <AdminDashboard /> : <CustomerPortal />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/billing" element={user.role === 'admin' ? <BillingManagement /> : <CustomerPortal />} />
                    <Route path="/port-forwarding" element={<PortForwardingTool />} />
                    <Route path="/tickets" element={<div className="text-center py-20 text-gray-400">Support Tickets Module</div>} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </Layout>
              ) : <Navigate to="/login" />} />
            </Routes>
          </Router>
        </CompanyContext.Provider>
      </MikrotikContext.Provider>
    </AuthContext.Provider>
  );
}
