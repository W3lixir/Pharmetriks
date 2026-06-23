-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 0008 — Dispensing guides (CENTRAL, admin-managed; shared by all accounts) ║
-- ║                                                                          ║
-- ║ One global table the admin curates. Every approved app fetches it        ║
-- ║ read-only (via /api/guides) and caches it for offline use. NOT per-user  ║
-- ║ (so it is NOT a user_data collection).                                   ║
-- ║                                                                          ║
-- ║ Medical-content disclaimer: these are general OTC pointers maintained by ║
-- ║ the operator — not a substitute for a doctor/pharmacist.                 ║
-- ║ Apply via: Supabase Dashboard → SQL Editor → paste → run.                ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

create table if not exists public.dispense_guides (
  id          uuid primary key default gen_random_uuid(),
  condition   text not null,
  category    text,
  aliases     text,                 -- extra search keywords
  meds        text,                 -- comma-separated generic names (for stock match)
  dosage      text,
  redflags    text,                 -- "refer to doctor if…"
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.dispense_guides enable row level security;

-- Any authenticated user may READ. Writes are service-role only (admin actions).
drop policy if exists "dispense_guides_read" on public.dispense_guides;
create policy "dispense_guides_read"
  on public.dispense_guides for select
  to authenticated
  using (true);

drop trigger if exists dispense_guides_touch on public.dispense_guides;
create trigger dispense_guides_touch
  before update on public.dispense_guides
  for each row execute procedure public.touch_updated_at();

-- Conservative, referral-heavy starter guides — only if the table is empty.
insert into public.dispense_guides (condition, category, aliases, meds, dosage, redflags)
select * from (values
  ('Lagnat (Fever)','Lagnat','fever, init, mainit ang katawan','Paracetamol',
   'Paracetamol 500mg kada 4-6 oras (max 4g/araw sa adult). Uminom ng maraming tubig, pahinga.',
   'Lagnat 3+ araw o 39°C+ na di bumababa, may pantal, matinding sakit ng ulo/leeg, hirap huminga, sanggol/buntis.'),
  ('Sakit ng Ulo (Headache)','Sakit ng Ulo','headache, sakit ulo, migraine','Paracetamol, Ibuprofen',
   'Paracetamol o Ibuprofen (kasama-kain ang Ibuprofen). Pahinga, iwas stress at gutom.',
   'Biglaan at sobrang tindi, may lagnat + matigas na leeg, pagkalito, paulit-ulit na pagsuka, after ng pagkakahampas sa ulo.'),
  ('Ubo at Sipon (Cough & Colds)','Ubo''t Sipon','cough, colds, ubo, sipon, baradong ilong','',
   'Pahinga + maraming tubig. OTC base sa sintomas — itanong muna ang allergy, presyon, sakit sa puso bago bigyan.',
   '1+ linggo na di gumagaling, hirap huminga, plema na may dugo, mataas na lagnat, sakit ng dibdib.'),
  ('LBM / Pagtatae (Diarrhea)','Tiyan / LBM','lbm, diarrhea, pagtatae, loose bowel','Oral Rehydration Salts',
   'ORS — ang hydration ang pinaka-importante. Iwas matabang/matamis na inumin pansamantala.',
   'May dugo sa dumi, sobrang dehydrated (lubog na mata, walang ihi), mataas na lagnat, sanggol/matanda, lagpas 2-3 araw.'),
  ('Acidity / Heartburn','Tiyan / LBM','acidity, heartburn, hyperacidity, sikmura','Antacid',
   'Antacid pagkatapos kumain o kapag may sintomas. Iwas maanghang/maasim, kape, sobrang busog bago matulog.',
   'Tuloy-tuloy na sakit, matinding sakit sa dibdib (baka puso!), pagbaba ng timbang, hirap lumunok, itim na dumi.'),
  ('Allergy / Pantal','Allergy','allergy, pantal, rashes, makati, hives','Cetirizine, Loratadine',
   'Antihistamine (Cetirizine o Loratadine), 1x/araw. Iwasan ang trigger.',
   'Namamaga ang mukha/labi/dila, hirap huminga, pagkahilo (ANAPHYLAXIS — emergency!), mabilis na pagkalat.'),
  ('Maliit na Sugat','Sugat','sugat, wound, gasgas, hiwa','',
   'Hugasan ng malinis na tubig at sabon, lagyan ng antiseptic, takpan. Panatilihing malinis.',
   'Malalim/malaki, di tumitigil ang dugo, namamaga/nagnanaknak, kagat ng hayop, marumi/kalawang na bagay (tetanus risk).')
) as v(condition, category, aliases, meds, dosage, redflags)
where not exists (select 1 from public.dispense_guides);
