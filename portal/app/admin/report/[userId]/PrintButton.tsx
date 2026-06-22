'use client';

import Icon from '@/components/ui/Icon';

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn-primary text-[13px] px-4 py-2.5"
    >
      <Icon name="install" size={14} /> Print / Save PDF
    </button>
  );
}
