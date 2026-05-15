import Icon from '@/components/ui/Icon';
import Pill from '@/components/ui/Pill';
import GlassCard from '@/components/ui/GlassCard';

type PreviewName = 'dispense' | 'inventory' | 'opex';
type Item = {
  icon: PreviewName;
  title: string;
  body: string;
  bullets: string[];
};

const ITEMS: Item[] = [
  {
    icon: 'dispense',
    title: 'Dispensing — bilis ng transaction',
    body: 'I-search ang gamot, i-add sa cart, dispense. Auto-deduct na ang stock, may receipt-style history sa likod.',
    bullets: [
      'Search by generic or brand',
      'Auto-detect low stock + expiry',
      'Optional customer name field',
    ],
  },
  {
    icon: 'inventory',
    title: 'Inventory — buong picture ng stock',
    body: 'Hindi mo na kailangang manghula. Real-time ang inventory count, may visual alerts sa low-stock at near-expiry items.',
    bullets: [
      'Batch tracking + expiry dates',
      'Bulk CSV import + export',
      'Low-stock / out-of-stock badges',
    ],
  },
  {
    icon: 'opex',
    title: 'OPEX — alam mo kung kumikita ka',
    body: 'Log expenses (rent, utilities, supplies, etc.), then see real revenue vs. expenses. May built-in net profit calculator.',
    bullets: [
      'Filter by today, week, month, all-time',
      'Categorized expense log',
      'Gross sales · Expenses · Net at a glance',
    ],
  },
];

export default function Preview() {
  return (
    <section id="preview" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Pill tone="blue">
            <Icon name="phone" size={11} /> Preview
          </Pill>
          <h2 className="mt-4 text-[28px] sm:text-4xl font-extrabold tracking-tight">
            3 sections, lahat ng kailangan mo.
          </h2>
          <p className="mt-3 text-[14.5px] text-ink-2/80 font-medium leading-relaxed">
            Walang clutter. Walang useless features. Yung gagamitin mo araw-araw lang.
          </p>
        </div>

        <div className="mt-12 space-y-6">
          {ITEMS.map((item, i) => {
            const reverse = i % 2 === 1;
            return (
              <GlassCard
                key={item.title}
                tone="strong"
                className={`p-6 sm:p-8 lg:p-10 grid gap-6 sm:gap-8 lg:gap-12 ${
                  reverse ? 'lg:grid-cols-[1fr_1.2fr]' : 'lg:grid-cols-[1.2fr_1fr]'
                }`}
              >
                <div className={`flex flex-col justify-center ${reverse ? 'lg:order-2' : ''}`}>
                  <div className="grid h-12 w-12 place-items-center rounded-[12px] bg-lyna-cta text-white shadow-glass">
                    <Icon name={item.icon} size={24} />
                  </div>
                  <h3 className="mt-4 text-[20px] sm:text-2xl font-extrabold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-2/80 font-medium">
                    {item.body}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {item.bullets.map(b => (
                      <li key={b} className="flex items-start gap-2.5 text-[13.5px] font-semibold text-ink">
                        <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-accent/15 text-accent shrink-0">
                          <Icon name="check" size={12} strokeWidth={2.6} />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`relative ${reverse ? 'lg:order-1' : ''}`}>
                  <div className="aspect-[4/3] rounded-glass bg-pink-soft border border-white/65 overflow-hidden p-5 relative">
                    <div aria-hidden className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-accent-soft/40 blur-2xl" />
                    <div aria-hidden className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-pink blur-2xl" />
                    <div className="relative h-full grid place-items-center">
                      <div className="grid h-24 w-24 sm:h-32 sm:w-32 place-items-center rounded-[24px] bg-white/80 backdrop-blur-md border border-white shadow-glass">
                        <Icon name={item.icon} size={48} className="text-accent" strokeWidth={1.6} />
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
