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
    body: 'Kahit brownout o walang load, tuloy ang benta. Once installed, hindi na kailangan ng internet — perfect sa probinsya at sa mga lugar na mahina ang signal.',
  },
  {
    icon: 'lock',
    title: 'Data stays sa phone mo',
    body: 'Walang cloud, walang server. Lahat ng sales, inventory, expenses — naka-save lang sa device mo. Ikaw lang ang may hawak, 100% private.',
  },
  {
    icon: 'dispense',
    title: 'Fast dispensing',
    body: 'Search products, build a cart, dispense — auto-deduct na ang stock. Hindi mo na kailangan i-update ang kwaderno pagkatapos ng bawat benta.',
  },
  {
    icon: 'inventory',
    title: 'Inventory tracking',
    body: 'Products, batches, expiry dates, SRP at cost — kabisado mo ang laman ng botika mo nang hindi nagbibilang isa-isa. May CSV import kung may listahan ka na.',
  },
  {
    icon: 'opex',
    title: 'Alam mo ang totoong kita',
    body: 'Log ang rent, kuryente, supplies — makikita mo ang tunay na tubo, hindi tantya. Filter by today, week, month, or all-time.',
  },
  {
    icon: 'zap',
    title: 'One-time ang app',
    body: 'Bilhin nang minsan ang app sa ₱249 — lifetime. Optional lang ang add-ons (₱99/buwan kung gamit mo). Ikaw ang may kontrol, hindi ginagatungan ng monthly bill ang budget mo.',
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Pill tone="blue">
            <Icon name="sparkle" size={11} /> Bakit Pharmetriks?
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
