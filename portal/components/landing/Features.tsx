import Icon from '@/components/ui/Icon';
import Pill from '@/components/ui/Pill';
import GlassCard from '@/components/ui/GlassCard';

type FeatureName = 'wifi-off' | 'lock' | 'dispense' | 'inventory' | 'opex' | 'zap';
type Feature = {
  icon: FeatureName;
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    icon: 'wifi-off',
    title: 'Works fully offline',
    body: 'Once installed, the app runs without internet. Perfect sa mga lugar na may unstable signal — barangay clinics, rural pharmacies, etc.',
  },
  {
    icon: 'lock',
    title: 'Data stays sa phone mo',
    body: "Walang cloud, walang server. Lahat ng sales, inventory, expenses — naka-save lang sa device mo. 100% private.",
  },
  {
    icon: 'dispense',
    title: 'Fast dispensing',
    body: 'Search products, build a cart, dispense — auto-deduct na ang stock. May built-in low-stock at expiry alerts.',
  },
  {
    icon: 'inventory',
    title: 'Inventory tracking',
    body: 'Manage products, batches, expiry dates, at SRP/cost. Import via CSV if may existing list ka na.',
  },
  {
    icon: 'opex',
    title: 'Track expenses',
    body: 'Log rent, utilities, supplies — see your real margins. Filter by today, week, month, or all-time.',
  },
  {
    icon: 'zap',
    title: 'No subscription',
    body: 'One-time ₱249 lang. Walang monthly bill. Tama ka sa technology na hindi gugugutom sa pocket mo every month.',
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Pill tone="blue">
            <Icon name="sparkle" size={11} /> Bakit RXaudit?
          </Pill>
          <h2 className="mt-4 text-[28px] sm:text-4xl font-extrabold tracking-tight">
            Built for real pharmacies, hindi para sa demo.
          </h2>
          <p className="mt-3 text-[14.5px] text-ink-2/80 font-medium leading-relaxed">
            Lahat ng feature, sinubukan sa actual operations. Walang fluff, walang sablay.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(f => (
            <GlassCard key={f.title} className="p-5 sm:p-6">
              <div className="grid h-11 w-11 place-items-center rounded-[12px] bg-lyna-cta text-white shadow-glass">
                <Icon name={f.icon} size={22} />
              </div>
              <h3 className="mt-4 text-[16px] font-extrabold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2/80 font-medium">
                {f.body}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
