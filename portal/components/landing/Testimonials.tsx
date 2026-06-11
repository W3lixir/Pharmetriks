import Icon from '@/components/ui/Icon';
import Pill from '@/components/ui/Pill';
import GlassCard from '@/components/ui/GlassCard';

// Real customer testimonials go here. Leave empty until you have actual
// quotes — the section then renders honest value-prop cards instead of
// fake reviews. To add one:
//   { quote: '…', name: 'Maria D.', pharmacy: 'Botika ni Maria', city: 'Cavite' }
type Testimonial = {
  quote: string;
  name: string;
  pharmacy: string;
  city: string;
};

const TESTIMONIALS: Testimonial[] = [];

// Shown while TESTIMONIALS is empty — promises, clearly labeled as such.
const PROMISES = [
  {
    title: 'Uuwi ka nang mas maaga',
    body: 'Hindi mo na kailangan mag-stay para magbilang at mag-total ng benta sa kwaderno. Tapos na ang araw mo pag-sara ng botika.',
  },
  {
    title: 'Alam mo kung kumikita ka talaga',
    body: 'Benta minus puhunan minus gastos — makikita mo ang totoong tubo sa isang tingin, hindi pakiramdam lang.',
  },
  {
    title: 'Kampante ka kahit wala ka sa botika',
    body: 'Naka-record lahat. Pagbalik mo, kita mo agad kung ano ang nabenta at kung ano ang kailangan nang i-order.',
  },
];

export default function Testimonials() {
  const hasReal = TESTIMONIALS.length > 0;

  return (
    <section id="testimonials" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Pill tone="pink">
            <Icon name="star" size={11} />{' '}
            {hasReal ? 'Ano ang sabi nila' : 'Early days — real reviews soon'}
          </Pill>
          <h2 className="mt-4 text-[28px] sm:text-4xl font-extrabold tracking-tight">
            {hasReal
              ? 'Mga botika na gumagamit na.'
              : 'Ang ipinangako namin sa ’yo.'}
          </h2>
          {!hasReal && (
            <p className="mt-3 text-[14.5px] text-ink-2/80 font-medium leading-relaxed">
              Bago pa lang kami — kaya wala muna kaming ipapaskil na review na
              hindi totoo. Ito ang panindigan namin habang dumadami ang users.
            </p>
          )}
        </div>

        <div className="mt-12 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hasReal
            ? TESTIMONIALS.map(t => (
                <GlassCard key={t.name + t.pharmacy} className="p-5 sm:p-6">
                  <Icon name="star" size={18} className="text-accent" />
                  <p className="mt-3 text-[14px] leading-relaxed text-ink font-medium">
                    “{t.quote}”
                  </p>
                  <div className="mt-4 text-[12.5px] font-extrabold text-ink-2">
                    {t.name}
                  </div>
                  <div className="text-[11.5px] font-semibold text-ink-2/65">
                    {t.pharmacy} · {t.city}
                  </div>
                </GlassCard>
              ))
            : PROMISES.map(p => (
                <GlassCard key={p.title} className="p-5 sm:p-6">
                  <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-lyna-cta text-white shadow-glass">
                    <Icon name="check" size={20} strokeWidth={2.6} />
                  </div>
                  <h3 className="mt-4 text-[16px] font-extrabold tracking-tight">{p.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2/80 font-medium">
                    {p.body}
                  </p>
                </GlassCard>
              ))}
        </div>
      </div>
    </section>
  );
}
