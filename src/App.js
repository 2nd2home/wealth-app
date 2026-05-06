import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart as PieIcon, 
  ListPlus, 
  Wallet, 
  Plus, 
  Trash2, 
  Edit2,
  Check,
  X,
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ArrowRightLeft,
  Landmark,
  Eye,
  EyeOff,
  Globe,
  Calendar,
  Search,
  ChevronDown,
  Filter,
  Save
} from 'lucide-react';

// 定義類別顏色與標籤
const ASSET_CATEGORIES = {
  cash: { label: '現金', color: '#10b981' },
  stock: { label: '股票', color: '#3b82f6' },
  fund: { label: '基金', color: '#8b5cf6' },
  realestate: { label: '不動產', color: '#f59e0b' },
  debt: { label: '負債', color: '#ef4444' }
};

const initialAssets = [
  { id: 'a1', name: '預設現金', type: 'cash', value: 0, currency: 'TWD', date: new Date().toISOString().split('T')[0] }
];

const initialTransactions = [];

// --- 子組件：總覽趨勢 ---
const Dashboard = ({ assets, transactions, formatMoney, getTwdValue }) => {
  const totalAssets = assets.reduce((sum, a) => sum + getTwdValue(a.value, a.currency), 0);
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-wider">總資產淨值</h2>
        <div className="text-3xl font-black text-slate-800">{formatMoney(totalAssets)}</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets.map(asset => (
          <div key={asset.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400 font-bold">{ASSET_CATEGORIES[asset.type].label}</p>
              <p className="font-bold text-slate-700">{asset.name}</p>
            </div>
            <p className="font-black text-slate-800">{formatMoney(getTwdValue(asset.value, asset.currency))}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold mb-4 flex items-center gap-2"><ArrowRightLeft size={18} className="text-emerald-500" /> 最近交易</h3>
        <div className="space-y-3">
          {transactions.slice(0, 5).map(t => (
            <div key={t.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
              <div>
                <p className="font-bold text-sm">{t.title}</p>
                <p className="text-[10px] text-slate-400">{t.date}</p>
              </div>
              <p className={`font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
              </p>
            </div>
          ))}
          {transactions.length === 0 && <p className="text-center text-slate-400 py-4 text-sm">尚無交易紀錄</p>}
        </div>
      </div>
    </div>
  );
};

// --- 子組件：記帳管理 ---
const TransactionsManager = ({ transactions, setTransactions, formatMoney }) => {
  const [form, setForm] = useState({ title: '', amount: '', type: 'expense', date: new Date().toISOString().split('T')[0] });

  const addTransaction = () => {
    if (!form.title || !form.amount) return;
    const newId = Date.now().toString();
    setTransactions([{ ...form, id: newId, amount: Number(form.amount) }, ...transactions]);
    setForm({ title: '', amount: '', type: 'expense', date: new Date().toISOString().split('T')[0] });
  };

  const removeTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={18} className="text-emerald-500" /> 新增收支</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="名稱" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20" />
          <input type="number" placeholder="金額" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="p-3 bg-slate-50 rounded-xl outline-none" />
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="p-3 bg-slate-50 rounded-xl outline-none">
            <option value="expense">支出</option>
            <option value="income">收入</option>
          </select>
          <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="p-3 bg-slate-50 rounded-xl outline-none" />
        </div>
        <button onClick={addTransaction} className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">儲存紀錄</button>
      </div>

      <div className="space-y-3">
        {transactions.map(t => (
          <div key={t.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
              <div>
                <p className="font-bold">{t.title}</p>
                <p className="text-xs text-slate-400">{t.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
              </span>
              <button onClick={() => removeTransaction(t.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 子組件：資產管理 ---
const AssetsManager = ({ assets, setAssets, formatMoney, usdRate }) => {
  const [newAsset, setNewAsset] = useState({ name: '', value: '', type: 'cash', currency: 'TWD' });

  const addAsset = () => {
    if (!newAsset.name || !newAsset.value) return;
    setAssets([...assets, { ...newAsset, id: Date.now().toString(), value: Number(newAsset.value) }]);
    setNewAsset({ name: '', value: '', type: 'cash', currency: 'TWD' });
  };

  const deleteAsset = (id) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Landmark size={18} className="text-emerald-500" /> 新增資產項目</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="資產名稱 (如：台積電)" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} className="p-3 bg-slate-50 rounded-xl outline-none" />
          <input type="number" placeholder="金額" value={newAsset.value} onChange={e => setNewAsset({...newAsset, value: e.target.value})} className="p-3 bg-slate-50 rounded-xl outline-none" />
          <select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} className="p-3 bg-slate-50 rounded-xl outline-none">
            {Object.entries(ASSET_CATEGORIES).map(([key, info]) => <option key={key} value={key}>{info.label}</option>)}
          </select>
          <select value={newAsset.currency} onChange={e => setNewAsset({...newAsset, currency: e.target.value})} className="p-3 bg-slate-50 rounded-xl outline-none">
            <option value="TWD">TWD (台幣)</option>
            <option value="USD">USD (美金)</option>
          </select>
        </div>
        <button onClick={addAsset} className="w-full mt-4 bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors">建立資產</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets.map(asset => (
          <div key={asset.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md uppercase">{ASSET_CATEGORIES[asset.type].label}</span>
              <button onClick={() => deleteAsset(asset.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
            </div>
            <div>
              <h4 className="font-bold text-slate-800">{asset.name}</h4>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {asset.currency === 'USD' ? `$${asset.value}` : formatMoney(asset.value)}
                {asset.currency === 'USD' && <span className="text-xs text-slate-400 ml-2">≈ {formatMoney(asset.value * usdRate)}</span>}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 主程式：App ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [usdRate, setUsdRate] = useState(32.5);

  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('wealth_assets_v14');
    return saved ? JSON.parse(saved) : initialAssets;
  });
  
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('wealth_transactions_v14');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  useEffect(() => {
    localStorage.setItem('wealth_assets_v14', JSON.stringify(assets));
    localStorage.setItem('wealth_transactions_v14', JSON.stringify(transactions));
  }, [assets, transactions]);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(amount);
  };

  const getTwdValue = (val, currency) => {
    return currency === 'USD' ? val * usdRate : val;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20 md:pb-0 md:flex">
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 md:relative md:w-64 md:h-screen md:border-t-0 md:border-r z-10 flex flex-col">
        <div className="hidden md:flex items-center p-6 border-b border-slate-100">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-3 shadow-lg">W</div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">財富管家 Pro</h1>
        </div>
        <div className="flex md:flex-col justify-around md:justify-start md:p-4 h-16 md:h-auto">
          <NavItem icon={<PieIcon size={20} />} label="總覽趨勢" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<ArrowRightLeft size={20} />} label="記帳明細" isActive={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
          <NavItem icon={<Landmark size={20} />} label="資產配置" isActive={activeTab === 'assets'} onClick={() => setActiveTab('assets')} />
        </div>
        
        <div className="hidden md:block mt-auto p-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-bold uppercase"><Globe size={12} /> 美金匯率</div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400">1 USD =</span>
              <input type="number" value={usdRate} onChange={(e) => setUsdRate(Number(e.target.value))} className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-black text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500/20"/>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen scroll-smooth">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard assets={assets} transactions={transactions} formatMoney={formatMoney} getTwdValue={getTwdValue} />}
          {activeTab === 'transactions' && <TransactionsManager transactions={transactions} setTransactions={setTransactions} formatMoney={formatMoney} />}
          {activeTab === 'assets' && <AssetsManager assets={assets} setAssets={setAssets} formatMoney={formatMoney} usdRate={usdRate} />}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col md:flex-row items-center justify-center md:justify-start w-full md:px-4 md:py-3.5 rounded-2xl transition-all duration-300 ${isActive ? 'text-emerald-700 md:bg-emerald-50 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600 md:hover:bg-slate-100'}`}>
      {icon}<span className="text-[10px] md:text-sm md:ml-3 font-bold">{label}</span>
    </button>
  );
}
