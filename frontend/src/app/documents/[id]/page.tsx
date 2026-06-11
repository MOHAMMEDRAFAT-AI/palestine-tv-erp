'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { cn, formatDate, formatFileSize, getFileIcon } from '@/lib/utils';
import { PRIORITY_LABELS, PRIORITY_COLORS, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [approveNotes, setApproveNotes] = useState('');

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await api.getDocument(id as string);
        setDoc(res.data.data);
      } catch (err) {
        toast.error('فشل في تحميل الكتاب');
        router.push('/documents');
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id]);

  const handleAction = async (action: string, extra?: any) => {
    setActionLoading(true);
    try {
      switch (action) {
        case 'send':
          await api.sendDocument(id as string);
          toast.success('تم إرسال الكتاب');
          break;
        case 'receive':
          await api.receiveDocument(id as string);
          toast.success('تم استلام الكتاب');
          break;
        case 'approve':
          await api.approveDocument(id as string, approveNotes);
          toast.success('تم اعتماد الكتاب');
          break;
        case 'reject':
          await api.rejectDocument(id as string, rejectReason);
          toast.success('تم رفض الكتاب');
          setShowRejectModal(false);
          setRejectReason('');
          break;
        case 'return':
          await api.returnDocument(id as string, returnNotes);
          toast.success('تم إعادة الكتاب');
          setShowReturnModal(false);
          setReturnNotes('');
          break;
        case 'archive':
          await api.archiveDocument(id as string);
          toast.success('تم أرشفة الكتاب');
          break;
      }
      const res = await api.getDocument(id as string);
      setDoc(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل تنفيذ العملية');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="spinner !w-10 !h-10 !border-4" />
      </div>
    );
  }

  if (!doc) return null;

  const canSend = doc.status === 'draft' && doc.sender_id === user?.id;
  const canReceive = doc.status === 'sent' && doc.receiver_id === user?.id;
  const canApprove = (doc.status === 'received' || doc.status === 'in_progress') && doc.receiver_id === user?.id;
  const canReject = (doc.status === 'sent' || doc.status === 'received') && doc.receiver_id === user?.id;
  const canReturn = doc.status === 'sent' && doc.receiver_id === user?.id;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back Button */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        العودة
      </button>

      {/* Document Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{doc.title}</h1>
            <p className="text-sm text-gray-500 mt-1">رقم الكتاب: {doc.document_number}</p>
          </div>
          <div className="flex gap-2">
            <span className={cn('badge', PRIORITY_COLORS[doc.priority])}>{PRIORITY_LABELS[doc.priority]}</span>
            <span className={cn('badge', STATUS_COLORS[doc.status])}>{STATUS_LABELS[doc.status]}</span>
          </div>
        </div>

        {/* Sender/Receiver Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="text-xs text-gray-500 mb-1">المرسل</p>
            <p className="font-medium text-gray-900">{doc.sender?.full_name_ar}</p>
            <p className="text-sm text-gray-500">{doc.sender?.employee_number}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">المستلم</p>
            <p className="font-medium text-gray-900">{doc.receiver?.full_name_ar}</p>
            <p className="text-sm text-gray-500">{doc.receiver?.employee_number}</p>
          </div>
        </div>

        {/* Document Body */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-2">نص الكتاب</h3>
          <div className="p-4 bg-white border border-gray-200 rounded-xl whitespace-pre-wrap text-gray-700 leading-relaxed">
            {doc.body}
          </div>
        </div>

        {/* Attachments */}
        {doc.attachments?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">المرفقات ({doc.attachments.length})</h3>
            <div className="space-y-2">
              {doc.attachments.map((att: any) => (
                <a
                  key={att.id}
                  href={`/storage/${att.stored_path}`}
                  target="_blank"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-xl">{getFileIcon(att.extension)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{att.original_name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(att.file_size)}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Rejection Reason */}
        {doc.rejection_reason && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-semibold text-red-700 mb-1">سبب الرفض</p>
            <p className="text-sm text-red-600">{doc.rejection_reason}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
          {canSend && (
            <button onClick={() => handleAction('send')} disabled={actionLoading} className="btn btn-primary">
              {actionLoading ? 'جاري الإرسال...' : 'إرسال الكتاب'}
            </button>
          )}
          {canReceive && (
            <button onClick={() => handleAction('receive')} disabled={actionLoading} className="btn btn-primary">
              {actionLoading ? 'جاري الاستلام...' : 'استلام الكتاب'}
            </button>
          )}
          {canApprove && (
            <div className="flex gap-2">
              <input
                type="text"
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                placeholder="ملاحظات الاعتماد (اختياري)"
                className="input w-48"
              />
              <button onClick={() => handleAction('approve')} disabled={actionLoading} className="btn bg-emerald-600 text-white hover:bg-emerald-700">
                {actionLoading ? 'جاري الاعتماد...' : 'اعتماد'}
              </button>
            </div>
          )}
          {canReject && (
            <button onClick={() => setShowRejectModal(true)} disabled={actionLoading} className="btn btn-danger">
              رفض
            </button>
          )}
          {canReturn && (
            <button onClick={() => setShowReturnModal(true)} disabled={actionLoading} className="btn btn-outline">
              إعادة مع ملاحظات
            </button>
          )}
          {!canSend && !canReceive && !canApprove && user?.role?.name === 'supervisor' && (
            <>
              <button onClick={() => handleAction('approve')} className="btn bg-emerald-600 text-white hover:bg-emerald-700">
                اعتماد
              </button>
              <button onClick={() => setShowRejectModal(true)} className="btn btn-danger">رفض</button>
            </>
          )}
          {(doc.status === 'completed' || doc.status === 'rejected') && doc.status !== 'archived' && (
            <button onClick={() => handleAction('archive')} className="btn btn-outline">
              أرشفة
            </button>
          )}
        </div>
      </div>

      {/* Document Trail (Audit) */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">سجل الحركة (Audit Trail)</h3>
        <div className="space-y-3">
          {doc.trails?.map((trail: any, idx: number) => (
            <div key={trail.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-600">{trail.user?.full_name_ar?.charAt(0)}</span>
                </div>
                {idx < doc.trails.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
              </div>
              <div className="flex-1 pb-3">
                <p className="text-sm font-medium text-gray-900">{trail.user?.full_name_ar}</p>
                <p className="text-xs text-gray-500">{trail.notes}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(trail.created_at, 'datetime')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">رفض الكتاب</h2>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="textarea mb-4"
              placeholder="الرجاء كتابة سبب الرفض..."
              rows={4}
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowRejectModal(false)} className="btn btn-outline">إلغاء</button>
              <button onClick={() => handleAction('reject')} disabled={!rejectReason || actionLoading} className="btn btn-danger">
                {actionLoading ? 'جاري...' : 'تأكيد الرفض'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="modal-overlay" onClick={() => setShowReturnModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">إعادة الكتاب مع ملاحظات</h2>
            <textarea
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              className="textarea mb-4"
              placeholder="الملاحظات..."
              rows={4}
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowReturnModal(false)} className="btn btn-outline">إلغاء</button>
              <button onClick={() => handleAction('return')} disabled={!returnNotes || actionLoading} className="btn btn-primary">
                {actionLoading ? 'جاري...' : 'إعادة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
