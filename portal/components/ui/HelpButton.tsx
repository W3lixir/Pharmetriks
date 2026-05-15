import Icon from './Icon';

/**
 * Floating chat-support button. Renders only if at least one of
 * NEXT_PUBLIC_SUPPORT_MESSENGER_URL or NEXT_PUBLIC_SUPPORT_WHATSAPP_URL is set.
 *
 * Server component — reads env at render time, no client JS.
 */
export default function HelpButton() {
  const msgr = process.env.NEXT_PUBLIC_SUPPORT_MESSENGER_URL;
  const wa   = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_URL;
  const mail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  if (!msgr && !wa && !mail) return null;
  const href  = msgr || wa || `mailto:${mail}`;
  const label = msgr ? 'Chat sa Messenger' : wa ? 'Chat sa WhatsApp' : 'Email support';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-lyna-cta text-white px-4 py-2.5 text-[13px] font-bold shadow-glass-lg transition hover:-translate-y-0.5"
      style={{ letterSpacing: '-0.1px' }}
    >
      <Icon name="help" size={16} />
      <span className="hidden sm:inline">May tanong? {label}</span>
      <span className="sm:hidden">Help</span>
    </a>
  );
}
