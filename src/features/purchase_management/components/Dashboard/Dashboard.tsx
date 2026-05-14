import { 
  ClipboardList, 
  FileText, 
  Truck, 
  AlertCircle, 
  Clock 
} from 'lucide-react';

const Dashboard = () => {
  // Mock Data (In a real app, this comes from your API)
  const stats = [
    { label: 'Pending PRs', count: 12, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active RFQs', count: 5, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Open POs', count: 8, icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Pending Deliveries', count: 3, icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const rejectedItems = [
    { id: 'REJ-101', material: 'Steel Rods', vendor: 'Global Steel Co.', reason: 'Diameter Mismatch' },
    { id: 'REJ-104', material: 'Industrial Oil', vendor: 'PetroChem Inc.', reason: 'Viscosity fail' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Overview of procurement and vendor activities</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className={`${stat.bg} p-3 rounded-lg mr-4`}>
              <stat.icon className={`${stat.color} w-6 h-6`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Tasks Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Awaiting Action</h2>
            <button className="outline-none text-blue-600 text-sm font-medium hover:underline">View All</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Material</th>
                <th className="px-6 py-3">Dept</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">PR-2023-08</td>
                <td className="px-6 py-4">Aluminum Sheets</td>
                <td className="px-6 py-4">Production</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Submitted</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">PO-9921</td>
                <td className="px-6 py-4">Copper Wiring</td>
                <td className="px-6 py-4">Electrical</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">RFQ Sent</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Alerts / QC Rejections */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center text-red-600 mb-4">
            <AlertCircle className="w-5 h-5 mr-2" />
            <h2 className="font-bold">Rejected Materials</h2>
          </div>
          <div className="space-y-4">
            {rejectedItems.map((item) => (
              <div key={item.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex justify-between">
                  <span className="font-bold text-xs text-red-800">{item.id}</span>
                  <span className="text-xs text-red-600 font-medium">{item.vendor}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 mt-1">{item.material}</p>
                <p className="text-xs text-red-700 mt-1 italic">Reason: {item.reason}</p>
              </div>
            ))}
          </div>
          <button className="outline-none w-full mt-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition">
            Process Returns
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;