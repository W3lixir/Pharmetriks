import Link from 'next/link';
import LegalShell from '@/components/legal/LegalShell';

export const metadata = {
  title: 'Refund Policy · RXaudit',
  description: 'RXaudit is a one-time ₱249 purchase with no refunds. Here\'s why, and how to make sure it\'s right for you bago mag-bayad.',
};

const SECTIONS = [
  { id: 'summary',    label: 'Summary' },
  { id: 'why',        label: 'Bakit ganito' },
  { id: 'before',     label: 'Bago mag-bayad' },
  { id: 'contact',    label: 'Contact' },
];

export default function RefundPolicyPage() {
  return (
    <LegalShell
      pill="Refund"
      title="No Refund Policy"
      subtitle="Pasensya na, lahat ng sales ay final. Pero affordable lang naman at may libreng preview — kaya gawin natin sigurado bago mag-bayad."
      updatedAt="2026-05-15"
      sections={SECTIONS}
    >
      <h2 id="summary">Summary</h2>
      <ul>
        <li>Sa ngayon, <strong>walang refunds</strong> — lahat ng payment ay final.</li>
        <li><strong>₱249 one-time</strong> ang price, lifetime access habambuhay ng app.</li>
        <li>Libre ang lahat ng info bago mag-bayad — features, FAQ, install guide.</li>
        <li>Kung may tanong ka, please message kami muna sa Facebook bago mag-bayad — happy to help.</li>
      </ul>

      <h2 id="why">Bakit ganito ang policy</h2>
      <p>
        Yung ₱249 ay sadyang pinanatiling mura para affordable sa lahat ng small
        pharmacy at solo owners. Sa price na yan, mahirap kaming mag-maintain ng
        full refund process — yung GCash transfer fees pa lang plus admin time,
        lampas na sa actual cost ng app.
      </p>
      <p>
        Sa halip, ginawa naming complete yung public info bago mag-bayad —
        features page, FAQ, screenshots, at install guide. Plus may Facebook
        page kami kung saan kami sumasagot ng questions. Ang goal: ma-decide mo
        nang maayos kung para sa'yo ang RXaudit bago mo ibigay ang ₱249 mo.
      </p>

      <h2 id="before">Bago mag-bayad — check muna these</h2>
      <p>Para sigurado, here are a few things to check:</p>
      <ul>
        <li>
          <strong>Compatible ba yung device mo?</strong> Modern Android (2019+) or
          iPhone (2018+) ay gumana ng maayos. Older devices, baka may konting
          issue sa PWA installation.
        </li>
        <li>
          <strong>Match ba sa use case mo?</strong> Tingnan yung{' '}
          <Link href="/#features">features</Link> at <Link href="/#faq">FAQ</Link> —
          designed siya for small-to-medium pharmacies na gusto ng offline-first
          tracking ng dispensing, inventory, at OPEX.
        </li>
        <li>
          <strong>OK ka ba sa offline-first?</strong> Walang cloud sync — yung
          data ng sales/inventory mo, nasa device mo lang. Mag-export ka ng CSV
          regularly bilang backup.
        </li>
        <li>
          <strong>Taglish OK?</strong> Mostly English ang labels at controls,
          pero Taglish ang explanations.
        </li>
      </ul>
      <p>
        May tanong pa? Ikaw ang first priority namin —{' '}
        <a href="https://www.facebook.com/rxauditph/" target="_blank" rel="noopener noreferrer">
          message niyo lang kami sa Facebook page
        </a>{' '}
        bago mag-bayad. Mas mabuti yung clear yung expectations sa simula pa lang.
      </p>

      <h2 id="contact">Contact</h2>
      <p>
        May tanong tungkol sa policy na ito, o sa account mo in general?{' '}
        <a href="https://www.facebook.com/rxauditph/" target="_blank" rel="noopener noreferrer">
          Message niyo lang kami sa Facebook
        </a>{' '}
        — sasagot kami within 24 hours. Mas maganda kung makaalam kami ng
        concerns mo bago mag-bayad kaysa pagkatapos.
      </p>
      <p>
        For technical questions, bugs, or suggestions, please check the{' '}
        <Link href="/contact">contact page</Link>. Salamat sa understanding!
      </p>
    </LegalShell>
  );
}
