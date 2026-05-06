import React, { useState, useEffect } from 'react';

// --- 預設資料 ---
const ASSET_CATEGORIES = {
  cash: { label: '現金', color: 'bg-emerald-500' },
  stock: { label: '股票', color: 'bg-blue-500' },
  fund: { label: '基金', color: 'bg-purple-500' },
  realestate: { label: '不動產', color: 'bg-amber-500' },
  debt: { label: '負債', color: 'bg-red-500' }
};

const initialAssets = [
  { id: '1', name: '銀行存款', type: 'cash', value: 100000, currency: 'TWD' }
];

// --- 內建圖示組件 (修正後的 SVG 路徑) ---
const Icon = ({ name }) => {
  const icons = {
    dashboard: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    list: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    wallet: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    plus: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
      </svg>
    ),
    trash: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    )
  };
  return icons[name] || null;
};

// --- 子組件：儀表板 ---
const Dashboard = ({ assets, transactions, formatMoney }) => {
  const total = assets.reduce((sum, a) => sum + Number(a.value), 0);
  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 rounded-3xl text-white shadow-xl mb-8">
        <p className="text-emerald-100 text-sm font-medium mb-2 opacity-80">淨資產總額</p>
        <h2 className="text-4xl font-black">{formatMoney(total)}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Icon name="wallet" /> 資產分布
          </h3>
          <div className="space-y-3">
            {assets.map(asset => (
              <div key={asset.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="font-medium text-slate-600">{asset.name}</span>
                <span className="font-bold text-slate-900">{formatMoney(asset.value)}</span>
              </div>
            ))}
            {assets.length === 0 && <p className="text-slate-400 text-center py-4">尚無資產</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Icon name="list" /> 最近收支
          </h3>
          {transactions.length === 0 ? (
            <p className="text-slate-400 text-center py-8">目前尚無紀錄</p>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 5).map(t => (
                <div key={t.id} className="flex justify-between p-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm">{t.title}</span>
                  <span className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 子組件：收支管理 ---
const Transactions = ({ transactions, setTransactions, formatMoney }) => {
  const [form, setForm] = useState({ title: '', amount: '', type: 'expense' });

  const handleAdd = () => {
    if (!form.title || !form.amount) return;
    setTransactions([{ ...form, id: Date.now().toString(), amount: Number(form.amount) }, ...transactions]);
    setForm({ title: '', amount: '', type: 'expense' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold mb-4">新增帳務紀錄</h3>
        <div className="flex flex-col gap-3">
          <input className="p-3 bg-slate-50 rounded-xl outline-none border border-transparent focus:border-emerald-500 transition-all" placeholder="項目名稱 (如：午餐)" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <input className="p-3 bg-slate-50 rounded-xl outline-none border border-transparent focus:border-emerald-500 transition-all" type="number" placeholder="金額" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
          <select className="p-3 bg-slate-50 rounded-xl outline-none border border-transparent focus:border-emerald-500 transition-all" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            <option value="expense">支出</option>
            <option value="income">收入</option>
          </select>
          <button onClick={handleAdd} className="bg-emerald-600 text-white p-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md">新增紀錄</button>
        </div>
      </div>
      <div className="space-y-2">
        {transactions.map(t => (
          <div key={t.id} className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm border border-slate-50">
            <div>
              <p className="font-bold text-slate-800">{t.title}</p>
              <p className="text-xs text-slate-400 font-medium">{t.type === 'income' ? '收入' : '支出'}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>{formatMoney(t.amount)}</span>
              <button onClick={() => setTransactions(transactions.filter(i => i.id !== t.id))} className="text-slate-200 hover:text-red-500 transition-colors"><Icon name="trash" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 子組件：資產管理 ---
const Assets = ({ assets, setAssets, formatMoney }) => {
  const [form, setForm] = useState({ name: '', value: '', type: 'cash' });

  const handleAdd = () => {
    if (!form.name || !form.value) return;
    setAssets([...assets, { ...form, id: Date.now().toString(), value: Number(form.value) }]);
    setForm({ name: '', value: '', type: 'cash' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold mb-4">新增資產項目</h3>
        <div className="grid grid-cols-1 gap-3">
          <input className="p-3 bg-slate-50 rounded-xl outline-none border border-transparent focus:border-emerald-500 transition-all" placeholder="資產名稱 (如：台積電)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input className="p-3 bg-slate-50 rounded-xl outline-none border border-transparent focus:border-emerald-500 transition-all" type="number" placeholder="目前價值" value={form.value} onChange={e => setForm({...form, value: e.target.value})} />
          <select className="p-3 bg-slate-50 rounded-xl outline-none border border-transparent focus:border-emerald-500 transition-all" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            {Object.entries(ASSET_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={handleAdd} className="bg-slate-800 text-white p-3 rounded-xl font-bold hover:bg-slate-900 transition-colors shadow-md">儲存資產</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets.map(a => (
          <div key={a.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center transition-transform hover:scale-[1.02]">
            <div>
              <span className={`text-[10px] px-2 py-0.5 rounded text-white ${ASSET_CATEGORIES[a.type].color} font-bold uppercase`}>{ASSET_CATEGORIES[a.type].label}</span>
              <h4 className="font-bold text-slate-800 mt-1">{a.name}</h4>
              <p className="text-xl font-black text-emerald-600">{formatMoney(a.value)}</p>
            </div>
            <button onClick={() => setAssets(assets.filter(i => i.id !== a.id))} className="text-slate-200 hover:text-red-500 transition-colors"><Icon name="trash" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 主程式 App ---
export default function App() {
  const [tab, setTab] = useState('home');
  const [assets, setAssets] = useState(() => {
    try {
      const s = localStorage.getItem('v1_assets');
      return s ? JSON.parse(s) : initialAssets;
    } catch (e) {
      return initialAssets;
    }
  });
  const [transactions, setTransactions] = useState(() => {
    try {
      const s = localStorage.getItem('v1_txs');
      return s ? JSON.parse(s) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('v1_assets', JSON.stringify(assets));
    localStorage.setItem('v1_txs', JSON.stringify(transactions));
  }, [assets, transactions]);

  const formatMoney = (v) => `NT$ ${Number(v).toLocaleString('zh-TW')}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* 側邊欄 / 導航 (手機版在底部，桌面版在左側) */}
      <aside className="fixed bottom-0 w-full bg-white border-t md:static md:w-64 md:border-t-0 md:border-r h-20 md:h-screen flex md:flex-col z-50">
        <div className="hidden md:flex p-8 items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-200">W</div>
          <span className="font-black text-xl tracking-tight text-slate-800">WealthHub</span>
        </div>
        <div className="flex md:flex-col flex-1 justify-around md:justify-start md:px-4 gap-2 py-2 md:py-0">
          <button onClick={() => setTab('home')} className={`flex flex-col md:flex-row items-center md:px-4 md:py-3 rounded-xl gap-1 md:gap-3 transition-all ${tab === 'home' ? 'text-emerald-600 md:bg-emerald-50 font-bold' : 'text-slate-400 hover:text-slate-600'}`}>
            <Icon name="dashboard" /> <span className="text-[10px] md:text-base">總覽趨勢</span>
          </button>
          <button onClick={() => setTab('tx')} className={`flex flex-col md:flex-row items-center md:px-4 md:py-3 rounded-xl gap-1 md:gap-3 transition-all ${tab === 'tx' ? 'text-emerald-600 md:bg-emerald-50 font-bold' : 'text-slate-400 hover:text-slate-600'}`}>
            <Icon name="list" /> <span className="text-[10px] md:text-base">記帳明細</span>
          </button>
          <button onClick={() => setTab('assets')} className={`flex flex-col md:flex-row items-center md:px-4 md:py-3 rounded-xl gap-1 md:gap-3 transition-all ${tab === 'assets' ? 'text-emerald-600 md:bg-emerald-50 font-bold' : 'text-slate-400 hover:text-slate-600'}`}>
            <Icon name="wallet" /> <span className="text-[10px] md:text-base">資產配置</span>
          </button>
        </div>
      </aside>

      {/* 內容區 */}
      <main className="flex-1 p-6 md:p-12 pb-32 md:pb-12 overflow-y-auto h-screen scroll-smooth">
        <div className="max-w-4xl mx-auto">
          {tab === 'home' && <Dashboard assets={assets} transactions={transactions} formatMoney={formatMoney} />}
          {tab === 'tx' && <Transactions transactions={transactions} setTransactions={setTransactions} formatMoney={formatMoney} />}
          {tab === 'assets' && <Assets assets={assets} setAssets={setAssets} formatMoney={formatMoney} />}
        </div>
      </main>
    </div>
  );
}
