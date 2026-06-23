-- Add "bawal isabay" (drug interactions) and "bawal sa" (contraindications)
-- fields to the central dispensing guides, plus backfill the 7 starter rows.
alter table public.dispense_guides
  add column if not exists interactions text,
  add column if not exists contraindications text;

update public.dispense_guides set
  interactions = 'Iwasan ang ibang gamot na may parehong active ingredient (Paracetamol) — risk ng overdose.',
  contraindications = 'Severe liver disease. Mag-ingat sa malnutrisyon o regular na alak.'
where condition = 'Lagnat (Fever)';

update public.dispense_guides set
  interactions = 'Iwasan ang Ibuprofen kasama ng Aspirin o ibang NSAID — dagdag panganib sa stomach bleeding. Huwag isabay ang Paracetamol sa ibang gamot na may Paracetamol din.',
  contraindications = 'Ibuprofen: peptic ulcer, asthma, malalang sakit sa bato. Paracetamol: severe liver disease.'
where condition = 'Sakit ng Ulo (Headache)';

update public.dispense_guides set
  interactions = 'Mag-ingat sa antihistamine + ibang pampatulog/alak (dagdag drowsiness). Decongestant: iwasan kasama ng gamot sa high blood pressure.',
  contraindications = 'Decongestant: hypertension, sakit sa puso. Antihistamine (sedating): hindi para sa nagmamaneho/operator ng makina.'
where condition = 'Ubo at Sipon (Cough & Colds)';

update public.dispense_guides set
  interactions = 'Huwag isabay ang loperamide kung may dugo sa dumi o mataas na lagnat — maaaring lalong magpasama.',
  contraindications = 'Loperamide: bata below 2 years old, may dugo sa dumi, mataas na lagnat (acute dysentery).'
where condition = 'LBM / Pagtatae (Diarrhea)';

update public.dispense_guides set
  interactions = 'Iwasan ang antacid kasama ng ibang oral na gamot (apektado ang absorption) — maghintay ng 2 oras sa pagitan.',
  contraindications = 'Severe kidney disease (para sa magnesium/aluminum antacids).'
where condition = 'Acidity / Heartburn';

update public.dispense_guides set
  interactions = 'Mag-ingat sa sedating antihistamine + alak o ibang pampatulog (dagdag antok).',
  contraindications = 'Sedating antihistamine: hindi para sa nagmamaneho/operator ng makina. Mag-ingat sa matatanda (dagdag pagkahilo).'
where condition = 'Allergy / Pantal';

update public.dispense_guides set
  interactions = null,
  contraindications = 'Huwag gamitin ang antiseptic sa malalim/malaking sugat — kailangan ng propesyonal na pag-alaga.'
where condition = 'Maliit na Sugat';
