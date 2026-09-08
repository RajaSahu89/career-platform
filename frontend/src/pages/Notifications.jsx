import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Notifications() {
  const { auth } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.myNotifications(auth.token).then(setItems);
  }, []);

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Notifications</h2>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-sm text-gray-500">No notifications yet.</p>}
        {items.map((n) => (
          <div key={n.id} className={`border rounded-md p-3 text-sm ${n.is_read ? 'bg-white text-gray-600' : 'bg-brand-50 text-gray-900'}`}>
            {n.message}
            <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
