import LegalShell from '@/components/legal/LegalShell';

export const metadata = {
  title: 'Privacy Policy · RXaudit',
  description:
    'How RXaudit collects, uses, and protects your data. Pharmacy data stays on your device — we never touch it.',
};

const SECTIONS = [
  { id: 'tldr',        label: 'TL;DR' },
  { id: 'what',        label: 'What we collect' },
  { id: 'how',         label: 'How we use it' },
  { id: 'storage',     label: 'Where data lives' },
  { id: 'sharing',     label: 'Sharing' },
  { id: 'cookies',     label: 'Cookies' },
  { id: 'rights',      label: 'Your rights' },
  { id: 'retention',   label: 'Retention' },
  { id: 'children',    label: 'Children' },
  { id: 'changes',     label: 'Changes' },
  { id: 'contact',     label: 'Contact' },
];

export default function PrivacyPage() {
  return (
    <LegalShell
      pill="Privacy"
      title="Privacy Policy"
      subtitle="Plain Taglish version of how we handle your data. Walang fine print na nakatago."
      updatedAt="2026-05-15"
      sections={SECTIONS}
    >
      <h2 id="tldr">TL;DR — sa madaling salita</h2>
      <ul>
        <li><strong>Pharmacy data mo</strong> (sales, inventory, expenses) — naka-save lang sa device mo. Hindi namin nakikita. Walang cloud sync.</li>
        <li><strong>Account info</strong> (email, full name, pharmacy name) — naka-store sa Supabase para sa authentication at admin approval.</li>
        <li><strong>GCash receipt</strong> — kinukuha namin para ma-verify ang bayad. Admin lang ang may access.</li>
        <li><strong>Walang ads, walang tracking, walang analytics</strong> sa current version.</li>
      </ul>

      <h2 id="what">What we collect</h2>

      <h3>Account information</h3>
      <p>Kapag nag-sign up ka, kinukuha namin:</p>
      <ul>
        <li>Email address</li>
        <li>Password (hashed — hindi namin nakikita yung plaintext)</li>
        <li>Full name</li>
        <li>Pharmacy name</li>
      </ul>

      <h3>Payment receipt</h3>
      <p>
        Kapag nag-upload ka ng GCash receipt screenshot, sini-save namin yung
        image file sa private storage. Pwede mo siyang i-replace anytime sa
        <code>/upload-receipt</code> page.
      </p>

      <h3>Server logs</h3>
      <p>
        Standard web server logs (IP address, browser type, timestamps).
        Hindi namin tini-tie ito sa account mo for tracking purposes —
        para lang sa security and debugging.
      </p>

      <h3>What we DO NOT collect</h3>
      <ul>
        <li>Yung mga produkto sa inventory mo</li>
        <li>Yung mga sales transactions mo</li>
        <li>Customer names na in-type mo</li>
        <li>Yung expenses na ni-record mo</li>
      </ul>
      <p>
        Lahat ng nasa list na yan, nasa <code>localStorage</code> ng browser mo
        lang. Walang network call na nagdadala niyan sa server namin.
      </p>

      <h2 id="how">How we use it</h2>
      <ul>
        <li><strong>Authentication</strong> — para malaman kung sino ka pag mag-login</li>
        <li><strong>License verification</strong> — para malaman kung approved ka na</li>
        <li><strong>Admin review</strong> — para ma-verify ang bayad mo</li>
        <li><strong>Communication</strong> — kung kailangan namin i-message ka tungkol sa account mo</li>
      </ul>

      <h2 id="storage">Where data lives</h2>
      <ul>
        <li>
          <strong>Pharmacy data</strong> → sa <code>localStorage</code> ng phone/browser mo. Hindi
          kami may copy.
        </li>
        <li>
          <strong>Account data</strong> → Supabase (PostgreSQL, hosted sa Southeast Asia
          region). Encrypted at rest, encrypted in transit (HTTPS).
        </li>
        <li>
          <strong>Receipts</strong> → Supabase Storage, private bucket. Per-user
          folder protected by row-level security policies — kahit ibang user, hindi
          makikita yung receipt mo.
        </li>
      </ul>

      <h2 id="sharing">Sharing</h2>
      <p>Hindi namin ibinibenta o sini-share ang data mo. Period.</p>
      <p>Exceptions (legal requirements lang):</p>
      <ul>
        <li>Kung mag-request ang Philippine authorities through a valid legal order</li>
        <li>Kung kailangan para ma-protect against fraud or abuse</li>
      </ul>

      <h2 id="cookies">Cookies</h2>
      <p>
        Ginagamit namin ang cookies para sa <strong>authentication only</strong> —
        para ma-remember ka pag mag-login. Walang tracking cookies, walang
        third-party cookies, walang ad cookies.
      </p>

      <h2 id="rights">Your rights (under the Philippine Data Privacy Act of 2012)</h2>
      <ul>
        <li><strong>Right to access</strong> — pwede mong hingin yung copy ng data namin tungkol sayo</li>
        <li><strong>Right to correct</strong> — kung mali yung info, pwedeng baguhin</li>
        <li><strong>Right to delete</strong> — pwedeng i-delete ang account mo anytime (email us)</li>
        <li><strong>Right to object</strong> — pwedeng mag-stop sa processing ng data mo</li>
      </ul>
      <p>
        Email mo lang kami para i-exercise ang rights mo. Sasagot kami within
        15 business days, max.
      </p>

      <h2 id="retention">Retention</h2>
      <ul>
        <li><strong>Account data</strong>: hangga't may account ka. After account deletion, 30 days backup retention.</li>
        <li><strong>Receipts</strong>: hangga't approved ang status mo. After deletion, immediately purged.</li>
        <li><strong>Admin audit log</strong>: 12 months para sa security review.</li>
        <li><strong>Server logs</strong>: 30 days.</li>
      </ul>

      <h2 id="children">Children</h2>
      <p>
        RXaudit ay para sa licensed pharmacy staff and adult business owners.
        Hindi namin sadyang kinokolekta ang data ng mga under 18. Kung sa
        tingin mo may bata na nag-sign up, message us at i-delete agad namin.
      </p>

      <h2 id="changes">Changes</h2>
      <p>
        Kapag may significant changes sa policy na ito, mag-eemail kami sa
        registered email mo at i-update yung "Last updated" date sa taas. Yung
        full history pwede mong makita sa GitHub commit log.
      </p>

      <h2 id="contact">Contact</h2>
      <p>
        Privacy concerns? Email <strong>support</strong>. Sa Pilipinas, pwede
        ka rin mag-file ng complaint sa{' '}
        <a href="https://www.privacy.gov.ph" target="_blank" rel="noopener noreferrer">
          National Privacy Commission (NPC)
        </a>{' '}
        kung sa tingin mo may violation.
      </p>
    </LegalShell>
  );
}
