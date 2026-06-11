import LegalShell from '@/components/legal/LegalShell';

export const metadata = {
  title: 'Terms of Service · Pharmetriks',
  description: 'The contract between you and Pharmetriks — written in plain Taglish, hindi legalese.',
};

const SECTIONS = [
  { id: 'accept',      label: 'Acceptance' },
  { id: 'account',     label: 'Your account' },
  { id: 'payment',     label: 'Payment & access' },
  { id: 'license',     label: 'What you can do' },
  { id: 'restrictions', label: 'What you cannot do' },
  { id: 'data',        label: 'Your data' },
  { id: 'support',     label: 'Support & updates' },
  { id: 'termination', label: 'Termination' },
  { id: 'warranty',    label: 'Warranty disclaimer' },
  { id: 'liability',   label: 'Liability limits' },
  { id: 'law',         label: 'Governing law' },
  { id: 'changes',     label: 'Changes' },
];

export default function TermsPage() {
  return (
    <LegalShell
      pill="Terms"
      title="Terms of Service"
      subtitle="Yung kasunduan natin. Bago ka gumamit ng Pharmetriks, basahin mo muna."
      updatedAt="2026-05-15"
      sections={SECTIONS}
    >
      <h2 id="accept">Acceptance</h2>
      <p>
        Pag nag-sign up ka or gumamit ng Pharmetriks, sumasang-ayon ka sa terms na
        ito. Kung hindi mo gusto ang terms, huwag mong gamitin ang service.
        Simple as that.
      </p>

      <h2 id="account">Your account</h2>
      <ul>
        <li>Isang account per person. Hindi pwedeng share account sa iba — illegal license sharing yan.</li>
        <li>Tama at totoong info ang ilagay mo sa signup form.</li>
        <li>Ikaw responsible sa pag-secure ng password mo. Pag may unauthorized login, message us agad.</li>
        <li>Pwede ka naman mag-install sa multiple devices na sayo, pero per-user license, hindi per-device.</li>
      </ul>

      <h2 id="payment">Payment &amp; access</h2>
      <ul>
        <li><strong>Price</strong>: ₱249 one-time payment via GCash.</li>
        <li><strong>What it includes</strong>: lifetime access sa current version ng app + free updates.</li>
        <li><strong>Approval</strong>: manual yung pag-approve namin after ma-verify yung receipt. Usually within a few hours.</li>
        <li><strong>Sales are final</strong>: please review the <a href="/refund-policy">No Refund Policy</a> bago mag-bayad.</li>
        <li>We encourage you to message us sa Facebook bago mag-bayad para masagot lahat ng tanong mo. May FAQ at features page din kami for reference.</li>
      </ul>

      <h2 id="license">What you can do with Pharmetriks</h2>
      <ul>
        <li>Gamitin sa <strong>commercial pharmacy operations</strong> mo</li>
        <li>I-install sa iba't ibang devices (phone, tablet, desktop) basta ikaw ang gumagamit</li>
        <li>Mag-export ng data anytime sa CSV</li>
        <li>Mag-back up ng data sa sarili mong drive</li>
      </ul>

      <h2 id="restrictions">What you cannot do</h2>
      <ul>
        <li><strong>Hindi mo pwedeng i-resell, sublicense, or distribute</strong> yung app sa iba</li>
        <li>Hindi mo pwedeng <strong>i-share ang account</strong> mo sa ibang business</li>
        <li>Hindi pwedeng mag-reverse engineer, decompile, or extract yung source code (para mag-build ng competing service)</li>
        <li>Hindi pwedeng mag-attempt ng unauthorized access sa servers namin or sa accounts ng ibang users</li>
        <li>Hindi pwedeng gamitin para sa illegal pharmacy activities (selling counterfeit drugs, etc.)</li>
      </ul>

      <h2 id="data">Your data</h2>
      <p>
        Tingnan ang <a href="/privacy">Privacy Policy</a> for full details.
        Quick summary:
      </p>
      <ul>
        <li>Yung pharmacy data mo (sales, inventory, expenses) nasa device mo lang — wala sa servers namin.</li>
        <li>Kami responsible sa pag-secure ng account info at receipt mo.</li>
        <li>Pwede mong i-export at i-delete ang lahat ng data anytime.</li>
      </ul>

      <h2 id="support">Support &amp; updates</h2>
      <ul>
        <li>May email support kami — sasagot within 24 hours during business days.</li>
        <li>Free updates habang buhay ng app — bug fixes, security patches, occasional new features.</li>
        <li>Reserved right namin to add premium features na hiwalay sa included plan na ito (e.g. multi-device cloud sync, team access). Yung core features ng current app, libre forever for paid users.</li>
      </ul>

      <h2 id="termination">Termination</h2>
      <p>Pwede namin i-terminate o i-suspend ang access mo kapag:</p>
      <ul>
        <li>May violation ka ng terms na ito</li>
        <li>Fraudulent ang payment mo (e.g. chargeback after access granted)</li>
        <li>May abuse ka ng service or ng customers ng iba</li>
      </ul>
      <p>
        Pwede mo rin i-terminate ang account mo anytime — email lang us. Hindi
        automatic na may refund kapag self-terminate ka — see refund policy.
      </p>

      <h2 id="warranty">Warranty disclaimer</h2>
      <p>
        Pharmetriks ay provided <strong>"as is"</strong>. Walang warranty na siya'y
        perfect, bug-free, or sakto sa specific use case mo. Gawin mo ang sariling
        verification para sa accuracy.
      </p>
      <p>
        <strong>Pharmetriks is a tool, hindi accounting or regulatory advice.</strong>{' '}
        Yung legal compliance ng pharmacy operations mo (FDA, BIR, DOH, LGU
        permits, etc.) ay responsibility mo pa rin.
      </p>

      <h2 id="liability">Liability limits</h2>
      <p>
        Sa pinakamalaking extent na pinapayagan ng batas, hindi kami liable
        para sa indirect, incidental, special, consequential, or punitive damages
        — kahit naabisuhan kami na pwede mangyari yun.
      </p>
      <p>
        Yung total liability namin sa lahat ng claims related sa service na ito,
        hindi lalampas sa <strong>amount na binayad mo sa nakaraang 12 months</strong>{' '}
        (= ₱249 max).
      </p>

      <h2 id="law">Governing law</h2>
      <p>
        Yung terms na ito ay governed by the laws of the <strong>Republic of the
        Philippines</strong>. Anumang dispute, dadalhin sa courts ng Pilipinas.
      </p>

      <h2 id="changes">Changes</h2>
      <p>
        Pag may significant changes sa terms, mag-eemail kami sa registered email
        mo at i-update yung "Last updated" date. Patuloy na paggamit ng app
        after the update = acceptance ng new terms.
      </p>
    </LegalShell>
  );
}
