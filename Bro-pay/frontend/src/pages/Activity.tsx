import React, { useState, useEffect } from 'react';
import { Activity as ActivityIcon, LogIn, ArrowDownLeft, ArrowUpRight, Settings, Clock } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import { api } from '../services/api';
import '../styles/activity.css';

interface ActivityItem {
  id: string;
  type: 'login' | 'transfer_in' | 'transfer_out' | 'settings' | 'system';
  title: string;
  description: string;
  time: string;
  ip?: string;
}

const Activity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await api.activity.list();
        setActivities((data.activities || []).map((item: any) => ({
          id: String(item.id),
          type: item.type || 'system',
          title: item.title,
          description: item.description,
          time: item.time,
          ip: item.ip,
        })));
      } catch (_err) {
        console.error('Failed to fetch activity');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'login': return <LogIn size={18} />;
      case 'transfer_in': return <ArrowDownLeft size={18} />;
      case 'transfer_out': return <ArrowUpRight size={18} />;
      case 'settings': return <Settings size={18} />;
      default: return <ActivityIcon size={18} />;
    }
  };

  return (
    <div className="activity-page">
      <div className="page-header">
        <h1>Activity History</h1>
      </div>

      <div className="activity-timeline">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="timeline-item skeleton">
              <div className="skeleton-avatar-box" style={{ width: 40, height: 40 }}></div>
              <div className="timeline-content">
                <div className="skeleton-text-box" style={{ width: '30%' }}></div>
                <div className="skeleton-text-box" style={{ width: '70%' }}></div>
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <EmptyState 
            icon={<ActivityIcon size={32} />}
            title="No activity yet"
            description="Your recent activity will appear here."
          />
        ) : (
          activities.map(activity => (
            <div key={activity.id} className="timeline-item">
              <div className={`timeline-icon ${activity.type}`}>
                {getIcon(activity.type)}
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <h4>{activity.title}</h4>
                  <span className="timeline-time"><Clock size={12} /> {activity.time}</span>
                </div>
                <p>{activity.description}</p>
                {activity.ip && <span className="timeline-ip">IP: {activity.ip}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Activity;
