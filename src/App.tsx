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
  X,
  ChevronRight
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
import 'jspdf-autotable';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Contexts ---
const AuthContext = createContext<any>(null);
const MikrotikContext = createContext<any>(null);

const useAuth = () => useContext(AuthContext);
const useMikrotik = () => useContext(MikrotikContext);

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
    // Simulate fetching stats
    setStats({
      totalUsers: 124,
      activeUsers: 118,
      dueBills: 12,
      revenue: 45200
    });
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
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()).then(setUsers);
  }, []);

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

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
      // Refresh user list
      fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(res => res.json()).then(setUsers);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button onClick={() => setShowAdd(true)}><Plus size={20} /> Add User</Button>
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
                <th className="px-6 py-4">Username</th>
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
                    <Button variant="ghost" className="text-xs">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Add User Modal Placeholder */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg"
            >
              <Card className="p-8">
                <h3 className="text-xl font-bold mb-6">Add New Subscriber</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Input label="Full Name" placeholder="John Doe" />
                  <Input label="Username" placeholder="john_pppoe" />
                  <Input label="Password" type="password" />
                  <Input label="Phone" placeholder="017..." />
                  <Input label="Package" placeholder="10 Mbps" />
                  <Input label="Monthly Fee" placeholder="800" />
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={() => setShowAdd(false)}>Create User</Button>
                  <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
                </div>
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
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | null>(null);
  const [paymentStep, setPaymentStep] = useState<'method' | 'processing' | 'success'>('method');

  useEffect(() => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    fetch('/api/bills', { headers }).then(res => res.json()).then(setBills);
    fetch('/api/tickets', { headers }).then(res => res.json()).then(setTickets);
  }, []);

  const generateInvoice = (bill: any) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("ISP Manager Pro - INVOICE", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Invoice ID: INV-${bill.id}`, 20, 40);
    doc.text(`Date: ${new Date(bill.created_at).toLocaleDateString()}`, 20, 45);
    doc.text(`Customer: ${user.full_name}`, 20, 50);
    
    (doc as any).autoTable({
      startY: 60,
      head: [['Description', 'Month', 'Amount']],
      body: [
        ['Internet Service Subscription', bill.month, `৳${bill.amount}`]
      ],
    });
    
    doc.text(`Total Paid: ৳${bill.amount}`, 150, (doc as any).lastAutoTable.finalY + 20);
    doc.save(`invoice-${bill.id}.pdf`);
  };

  const handlePay = async (method: 'bKash' | 'Nagad') => {
    setPaymentMethod(method);
    setPaymentStep('processing');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const headers = { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    };
    
    const res = await fetch('/api/bills/pay', {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        bill_id: payingBill.id, 
        payment_method: method, 
        transaction_id: (method === 'bKash' ? 'BK' : 'NG') + Math.random().toString(36).substring(7).toUpperCase() 
      })
    });

    if (res.ok) {
      setPaymentStep('success');
      // Refresh bills
      fetch('/api/bills', { headers }).then(res => res.json()).then(setBills);
      setTimeout(() => {
        setPayingBill(null);
        setPaymentStep('method');
      }, 2000);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black text-white">
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Current Package</p>
          <h2 className="text-4xl font-bold mb-4">10 Mbps</h2>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/60 text-xs">Validity Until</p>
              <p className="font-bold">Oct 25, 2025</p>
            </div>
            <Button variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20">Upgrade</Button>
          </div>
        </Card>
        
        <Card className="flex flex-col justify-center">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Last Payment</p>
          <h2 className="text-3xl font-bold mb-1">৳800.00</h2>
          <p className="text-green-600 text-sm font-medium flex items-center gap-1">
            <CheckCircle2 size={14} /> Paid via bKash
          </p>
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
                            <p className="text-xs text-gray-500">Pay using bKash account</p>
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
                            <p className="text-xs text-gray-500">Pay using Nagad account</p>
                          </div>
                        </div>
                        <ChevronRight className="text-[#F7941D] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </div>
                )}

                {paymentStep === 'processing' && (
                  <div className="p-12 text-center space-y-6">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className={cn(
                        "absolute inset-0 rounded-full border-4 border-t-transparent animate-spin",
                        paymentMethod === 'bKash' ? "border-[#D12053]" : "border-[#F7941D]"
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

// --- Layout ---

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { status } = useMikrotik();
  const navigate = useNavigate();

  const menuItems = user?.role === 'admin' ? [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Subscribers', path: '/users' },
    { icon: Receipt, label: 'Billing', path: '/billing' },
    { icon: Ticket, label: 'Support', path: '/tickets' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ] : [
    { icon: LayoutDashboard, label: 'My Portal', path: '/' },
    { icon: Receipt, label: 'My Bills', path: '/billing' },
    { icon: Ticket, label: 'Support', path: '/tickets' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-black/5 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Wifi size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg">ISP Manager</span>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
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
        <div className="p-4 border-t border-black/5">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Wifi size={24} />
            </div>
            {user?.role === 'admin' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-black/5 rounded-full">
                <div className={cn("w-2 h-2 rounded-full", status?.connected ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  MikroTik: {status?.connected ? "Connected" : "Disconnected"}
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
        <div className="p-8 overflow-y-auto">
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
  const [generating, setGenerating] = useState(false);
  const [reminding, setReminding] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const fetchBills = () => {
    fetch('/api/bills', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()).then(setBills);
  };

  useEffect(fetchBills, []);

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
              <th className="px-6 py-4">Month</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {bills.map(bill => (
              <tr key={bill.id}>
                <td className="px-6 py-4 font-medium">{bill.user_name}</td>
                <td className="px-6 py-4">{bill.month}</td>
                <td className="px-6 py-4 font-bold">৳{bill.amount}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                    bill.status === 'paid' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {bill.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">{bill.payment_method || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const SettingsPage = () => {
  const [settings, setSettings] = useState<any>({
    mikrotik_host: '',
    mikrotik_port: '8728',
    mikrotik_user: '',
    mikrotik_password: ''
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const { refresh, status } = useMikrotik();

  useEffect(() => {
    fetch('/api/settings', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.mikrotik_host) setSettings(data);
    });
  }, []);

  const handleSave = async () => {
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
      }
    } catch (e) {
      alert("Failed to save settings.");
    }
    setSaving(false);
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
    <div className="max-w-2xl space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Settings</h2>
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-2",
          status?.connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        )}>
          <div className={cn("w-2 h-2 rounded-full", status?.connected ? "bg-green-500" : "bg-red-500")} />
          {status?.connected ? "MikroTik Connected" : "MikroTik Disconnected"}
        </div>
      </div>
      
      <Card className="space-y-6">
        <h3 className="font-bold flex items-center gap-2"><Wifi size={18} /> MikroTik Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Host IP / URL" 
            value={settings.mikrotik_host} 
            onChange={(e: any) => setSettings({...settings, mikrotik_host: e.target.value})}
            placeholder="e.g. 192.168.88.1"
          />
          <Input 
            label="API Port" 
            value={settings.mikrotik_port} 
            onChange={(e: any) => setSettings({...settings, mikrotik_port: e.target.value})}
            placeholder="8728"
          />
          <Input 
            label="Username" 
            value={settings.mikrotik_user} 
            onChange={(e: any) => setSettings({...settings, mikrotik_user: e.target.value})}
            placeholder="admin"
          />
          <Input 
            label="Password" 
            type="password" 
            value={settings.mikrotik_password} 
            onChange={(e: any) => setSettings({...settings, mikrotik_password: e.target.value})}
            placeholder="••••••••"
          />
        </div>
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-blue-700 font-bold uppercase tracking-wider">Connection Status</p>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-md",
              status?.connected ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
            )}>
              {status?.connected ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
          
          <p className="text-[11px] text-blue-800 leading-relaxed">
            {status?.message || "No status message available."}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200">
            <div>
              <p className="text-[9px] text-blue-500 uppercase font-bold">Detected Host</p>
              <p className="text-xs font-mono text-blue-900">{status?.host || 'None'}</p>
            </div>
            <div>
              <p className="text-[9px] text-blue-500 uppercase font-bold">IP Type</p>
              <p className="text-xs font-bold text-blue-900">{status?.isPrivate ? "Private (Local)" : "Public (Internet)"}</p>
            </div>
          </div>

          <p className="text-[10px] text-blue-600 italic pt-2">
            <strong>Pro Tip:</strong> Ensure the API service is enabled in MikroTik: <code>/ip service enable api</code> and port 8728 is forwarded if you are behind a NAT.
          </p>
          
          {status?.isPrivate && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-800 font-medium">
                <strong>Private IP Warning:</strong> The IP <code>{status.host}</code> is a private address. This hosted app cannot reach it directly. You must use a <strong>Public IP</strong> or a <strong>Tunnel (Ngrok/Tailscale)</strong>.
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button className="flex-1" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
          <Button variant="secondary" className="flex-1" onClick={handleTest} disabled={testing}>
            {testing ? "Testing..." : "Test Connection"}
          </Button>
        </div>
      </Card>

      <Card className="space-y-6">
        <h3 className="font-bold flex items-center gap-2"><CreditCard size={18} /> Payment Gateways</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="font-medium">bKash Integration</span>
            <span className="text-xs text-green-600 font-bold uppercase">Connected</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="font-medium">Nagad Integration</span>
            <span className="text-xs text-gray-400 font-bold uppercase">Not Configured</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

// --- App Root ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mikrotikStatus, setMikrotikStatus] = useState<any>(null);

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
      setUser(JSON.parse(savedUser));
      fetchMikrotikStatus();
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
    <AuthContext.Provider value={{ user, login, logout }}>
      <MikrotikContext.Provider value={{ status: mikrotikStatus, refresh: fetchMikrotikStatus }}>
        <Router>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/*" element={user ? (
              <Layout>
                <Routes>
                  <Route path="/" element={user.role === 'admin' ? <AdminDashboard /> : <CustomerPortal />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/billing" element={user.role === 'admin' ? <BillingManagement /> : <CustomerPortal />} />
                  <Route path="/tickets" element={<div className="text-center py-20 text-gray-400">Support Tickets Module</div>} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </Layout>
            ) : <Navigate to="/login" />} />
          </Routes>
        </Router>
      </MikrotikContext.Provider>
    </AuthContext.Provider>
  );
}
