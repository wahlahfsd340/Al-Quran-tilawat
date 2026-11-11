export const RECITERS = [
  { id: 'ar.alafasy', name: { en: 'Mishary Rashid Alafasy', ur: 'مشاری راشد العفاسی' }, place: { en: 'Kuwait', ur: 'کویت' } },
  { id: 'ar.abdulbasitmurattal', name: { en: 'Abdul Basit Abdus Samad', ur: 'عبدالباسط عبدالصمد' }, place: { en: 'Egypt', ur: 'مصر' } },
  { id: 'ar.husary', name: { en: 'Mahmoud Khalil Al-Husary', ur: 'محمود خلیل الحصری' }, place: { en: 'Egypt', ur: 'مصر' } },
  { id: 'ar.minshawi', name: { en: 'Mohamed Siddiq Al-Minshawi', ur: 'محمد صدیق المنشاوی' }, place: { en: 'Egypt', ur: 'مصر' } },
  { id: 'ar.abdurrahmaansudais', name: { en: 'Abdur Rahman As-Sudais', ur: 'عبدالرحمٰن السدیس' }, place: { en: 'Masjid al-Haram, Makkah', ur: 'مسجد الحرام، مکہ مکرمہ' } },
  { id: 'ar.saoodshuraym', name: { en: 'Saud Ash-Shuraim', ur: 'سعود الشریم' }, place: { en: 'Masjid al-Haram, Makkah', ur: 'مسجد الحرام، مکہ مکرمہ' } },
  { id: 'ar.mahermuaiqly', name: { en: 'Maher Al-Muaiqly', ur: 'ماہر المعیقلی' }, place: { en: 'Masjid al-Haram, Makkah', ur: 'مسجد الحرام، مکہ مکرمہ' } },
  { id: 'ar.hudhaify', name: { en: 'Ali Al-Hudhaify', ur: 'علی الحذیفی' }, place: { en: 'Masjid an-Nabawi, Madinah', ur: 'مسجدِ نبوی، مدینہ منورہ' } },
  { id: 'ar.shaatree', name: { en: 'Abu Bakr Ash-Shatri', ur: 'ابوبکر الشاطری' }, place: { en: 'Saudi Arabia', ur: 'سعودی عرب' } },
  { id: 'ar.ahmedajamy', name: { en: 'Ahmed ibn Ali Al-Ajamy', ur: 'احمد بن علی العجمی' }, place: { en: 'Saudi Arabia', ur: 'سعودی عرب' } },
];

export const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

// Ayat ul Kursi (Surah Al-Baqarah 2:255), line by line.
// At runtime the app compares these lines with the official text and falls back to the official text if they differ.
export const KURSI_LINES = [
  'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ',
  'لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ',
  'لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ',
  'مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ',
  'يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ',
  'وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ',
  'وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ',
  'وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ',
  'وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ',
];

export const baseLetters = (s) => s.replace(/[^\u0621-\u063A\u0641-\u064A\u0671]/g, '');

// Verse-end number in Arabic-Indic digits, as printed in mushafs
export const arabicDigits = (x) => String(x).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
