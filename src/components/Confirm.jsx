import Modal from './Modal.jsx'

export default function Confirm({ title, message, onConfirm, onCancel, confirmText = 'Hapus', danger = true }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Batal
        </button>
        <button
          onClick={onConfirm}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
            danger ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-600 hover:bg-brand-700'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}
