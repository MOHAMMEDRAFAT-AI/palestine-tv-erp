'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { cn, formatDate, formatFileSize, getFileIcon } from '@/lib/utils';
import { supabase, subscribeToChatRoom } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.getChatRooms();
        setRooms(res.data.data);
        if (res.data.data.length > 0) {
          setActiveRoom(res.data.data[0]);
        }
      } catch {
        toast.error('فشل تحميل غرف الدردشة');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const res = await api.getMessages(activeRoom.id);
        setMessages(res.data.data.reverse());
      } catch {
        toast.error('فشل تحميل الرسائل');
      } finally {
        setMessagesLoading(false);
      }
    };
    fetchMessages();
    api.markRoomRead(activeRoom.id);

    // Subscribe to real-time messages
    const subscription = subscribeToChatRoom(activeRoom.id, async (payload) => {
      if (payload.new && payload.new.sender_id !== user?.id) {
        setMessages((prev) => [...prev, payload.new]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [activeRoom?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    const formData = new FormData();
    if (newMessage.trim()) formData.append('body', newMessage);
    if (file) formData.append('file', file);

    try {
      const res = await api.sendMessage(activeRoom.id, formData);
      setMessages((prev) => [...prev, res.data.data]);
      setNewMessage('');
      setFile(null);
    } catch {
      toast.error('فشل إرسال الرسالة');
    }
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'department': return '🏢';
      case 'office': return '🏛️';
      case 'top_management': return '⭐';
      default: return '💬';
    }
  };

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'department': return 'دردشة الدائرة';
      case 'office': return 'دردشة المكتب';
      case 'top_management': return 'دردشة الإدارة العليا';
      default: return 'محادثة';
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] animate-fade-in">
      <div className="flex h-full gap-4">
        {/* Room List */}
        <div className="w-72 flex-shrink-0 card overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">الدردشات</h2>
          </div>
          <div className="overflow-y-auto h-full">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <div key={i} className="skeleton h-16 w-full" />)}
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">لا توجد غرف دردشة</div>
            ) : (
              rooms.map((room: any) => (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={cn(
                    'w-full text-right p-3 hover:bg-gray-50 transition-colors border-b border-gray-50',
                    activeRoom?.id === room.id && 'bg-green-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getRoomIcon(room.type)}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {room.name_ar || getRoomTypeLabel(room.type)}
                      </p>
                      <p className="text-xs text-gray-500">{getRoomTypeLabel(room.type)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 card flex flex-col overflow-hidden">
          {/* Room Header */}
          {activeRoom && (
            <div className="p-4 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <span className="text-xl">{getRoomIcon(activeRoom.type)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {activeRoom.name_ar || getRoomTypeLabel(activeRoom.type)}
                  </h3>
                  <p className="text-xs text-gray-500">{activeRoom.users?.length || 0} مشارك</p>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messagesLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-3">
                    <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="skeleton h-16 w-48" />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                لا توجد رسائل بعد... ابدأ المحادثة
              </div>
            ) : (
              messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-3',
                    msg.sender_id === user?.id ? 'flex-row-reverse' : ''
                  )}
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-green-700">
                      {msg.sender?.full_name_ar?.charAt(0)}
                    </span>
                  </div>
                  <div className={cn(
                    'max-w-[70%]',
                    msg.sender_id === user?.id ? 'items-end' : 'items-start'
                  )}>
                    <p className="text-xs text-gray-500 mb-0.5">{msg.sender?.full_name_ar}</p>
                    <div className={cn(
                      'rounded-2xl px-4 py-2',
                      msg.sender_id === user?.id
                        ? 'bg-green-700 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    )}>
                      {msg.type === 'text' && <p className="text-sm">{msg.body}</p>}
                      {msg.type === 'image' && (
                        <img src={`/storage/${msg.file_path}`} alt="" className="max-w-xs rounded-lg" />
                      )}
                      {msg.type === 'file' && msg.file_path && (
                        <a href={`/storage/${msg.file_path}`} target="_blank" className="flex items-center gap-2 text-sm underline">
                          {getFileIcon(msg.file_type || '')} {msg.file_name}
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(msg.created_at, 'time')}
                      {msg.reads?.length > 0 && msg.sender_id === user?.id && ' ✓'}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {activeRoom && (
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100">
              {file && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm">{file.name}</span>
                  <button type="button" onClick={() => setFile(null)} className="text-red-500 text-sm">✕</button>
                </div>
              )}
              <div className="flex gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 hover:bg-gray-100 rounded-lg text-gray-500"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="input flex-1"
                  placeholder="اكتب رسالتك..."
                />
                <button type="submit" disabled={!newMessage.trim() && !file} className="btn btn-primary !px-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
