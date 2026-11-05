import Modal from './Modal.jsx'
import { btn } from '../lib/buttons.js'

export default function Confirm({ title, message, onConfirm, onCancel, confirmText = 'Hapus', danger = true }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className={btn.neutral}>
            Batal
          </button>
          <button onClick={onConfirm} className={danger ? btn.danger : btn.primary}>
            {confirmText}
          </button>
        </div>
      }
    >
      <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
    </Modal>
  )
}
