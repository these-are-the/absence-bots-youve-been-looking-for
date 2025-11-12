// Public holidays for Slovenia and Munich area (Bavaria, Germany)
// Data covers 2025-2035

export interface Holiday {
  date: string; // ISO date string (YYYY-MM-DD)
  name: {
    en: string;
    sl: string;
    de: string;
  };
  office: 'ljubljana' | 'munich' | 'both';
}

// Slovenian public holidays
const slovenianHolidays: Holiday[] = [
  // 2025
  { date: '2025-01-01', name: { en: 'New Year\'s Day', sl: 'Novo leto', de: 'Neujahr' }, office: 'ljubljana' },
  { date: '2025-01-02', name: { en: 'New Year Holiday', sl: 'Novoletni praznik', de: 'Neujahrstag' }, office: 'ljubljana' },
  { date: '2025-02-08', name: { en: 'Prešeren Day', sl: 'Prešernov dan', de: 'Prešeren-Tag' }, office: 'ljubljana' },
  { date: '2025-04-27', name: { en: 'Day of Uprising Against Occupation', sl: 'Dan upora proti okupatorju', de: 'Tag des Aufstands gegen die Besatzung' }, office: 'ljubljana' },
  { date: '2025-05-01', name: { en: 'Labour Day', sl: 'Praznik dela', de: 'Tag der Arbeit' }, office: 'both' },
  { date: '2025-05-02', name: { en: 'Labour Day Holiday', sl: 'Praznik dela', de: 'Tag der Arbeit' }, office: 'ljubljana' },
  { date: '2025-06-25', name: { en: 'Statehood Day', sl: 'Dan državnosti', de: 'Staatlichkeitstag' }, office: 'ljubljana' },
  { date: '2025-08-15', name: { en: 'Assumption Day', sl: 'Marijino vnebovzetje', de: 'Mariä Himmelfahrt' }, office: 'both' },
  { date: '2025-10-31', name: { en: 'Reformation Day', sl: 'Dan reformacije', de: 'Reformationstag' }, office: 'ljubljana' },
  { date: '2025-11-01', name: { en: 'All Saints\' Day', sl: 'Dan spomina na mrtve', de: 'Allerheiligen' }, office: 'both' },
  { date: '2025-12-25', name: { en: 'Christmas', sl: 'Božič', de: 'Weihnachten' }, office: 'both' },
  { date: '2025-12-26', name: { en: 'Independence Day', sl: 'Dan samostojnosti', de: 'Unabhängigkeitstag' }, office: 'ljubljana' },
  
  // 2026
  { date: '2026-01-01', name: { en: 'New Year\'s Day', sl: 'Novo leto', de: 'Neujahr' }, office: 'ljubljana' },
  { date: '2026-01-02', name: { en: 'New Year Holiday', sl: 'Novoletni praznik', de: 'Neujahrstag' }, office: 'ljubljana' },
  { date: '2026-02-08', name: { en: 'Prešeren Day', sl: 'Prešernov dan', de: 'Prešeren-Tag' }, office: 'ljubljana' },
  { date: '2026-04-27', name: { en: 'Day of Uprising Against Occupation', sl: 'Dan upora proti okupatorju', de: 'Tag des Aufstands gegen die Besatzung' }, office: 'ljubljana' },
  { date: '2026-05-01', name: { en: 'Labour Day', sl: 'Praznik dela', de: 'Tag der Arbeit' }, office: 'both' },
  { date: '2026-05-02', name: { en: 'Labour Day Holiday', sl: 'Praznik dela', de: 'Tag der Arbeit' }, office: 'ljubljana' },
  { date: '2026-06-25', name: { en: 'Statehood Day', sl: 'Dan državnosti', de: 'Staatlichkeitstag' }, office: 'ljubljana' },
  { date: '2026-08-15', name: { en: 'Assumption Day', sl: 'Marijino vnebovzetje', de: 'Mariä Himmelfahrt' }, office: 'both' },
  { date: '2026-10-31', name: { en: 'Reformation Day', sl: 'Dan reformacije', de: 'Reformationstag' }, office: 'ljubljana' },
  { date: '2026-11-01', name: { en: 'All Saints\' Day', sl: 'Dan spomina na mrtve', de: 'Allerheiligen' }, office: 'both' },
  { date: '2026-12-25', name: { en: 'Christmas', sl: 'Božič', de: 'Weihnachten' }, office: 'both' },
  { date: '2026-12-26', name: { en: 'Independence Day', sl: 'Dan samostojnosti', de: 'Unabhängigkeitstag' }, office: 'ljubljana' },
  
  // 2027
  { date: '2027-01-01', name: { en: 'New Year\'s Day', sl: 'Novo leto', de: 'Neujahr' }, office: 'ljubljana' },
  { date: '2027-01-02', name: { en: 'New Year Holiday', sl: 'Novoletni praznik', de: 'Neujahrstag' }, office: 'ljubljana' },
  { date: '2027-02-08', name: { en: 'Prešeren Day', sl: 'Prešernov dan', de: 'Prešeren-Tag' }, office: 'ljubljana' },
  { date: '2027-04-27', name: { en: 'Day of Uprising Against Occupation', sl: 'Dan upora proti okupatorju', de: 'Tag des Aufstands gegen die Besatzung' }, office: 'ljubljana' },
  { date: '2027-05-01', name: { en: 'Labour Day', sl: 'Praznik dela', de: 'Tag der Arbeit' }, office: 'both' },
  { date: '2027-05-02', name: { en: 'Labour Day Holiday', sl: 'Praznik dela', de: 'Tag der Arbeit' }, office: 'ljubljana' },
  { date: '2027-06-25', name: { en: 'Statehood Day', sl: 'Dan državnosti', de: 'Staatlichkeitstag' }, office: 'ljubljana' },
  { date: '2027-08-15', name: { en: 'Assumption Day', sl: 'Marijino vnebovzetje', de: 'Mariä Himmelfahrt' }, office: 'both' },
  { date: '2027-10-31', name: { en: 'Reformation Day', sl: 'Dan reformacije', de: 'Reformationstag' }, office: 'ljubljana' },
  { date: '2027-11-01', name: { en: 'All Saints\' Day', sl: 'Dan spomina na mrtve', de: 'Allerheiligen' }, office: 'both' },
  { date: '2027-12-25', name: { en: 'Christmas', sl: 'Božič', de: 'Weihnachten' }, office: 'both' },
  { date: '2027-12-26', name: { en: 'Independence Day', sl: 'Dan samostojnosti', de: 'Unabhängigkeitstag' }, office: 'ljubljana' },
  
  // 2028
  { date: '2028-01-01', name: { en: 'New Year\'s Day', sl: 'Novo leto', de: 'Neujahr' }, office: 'ljubljana' },
  { date: '2028-01-02', name: { en: 'New Year Holiday', sl: 'Novoletni praznik', de: 'Neujahrstag' }, office: 'ljubljana' },
  { date: '2028-02-08', name: { en: 'Prešeren Day', sl: 'Prešernov dan', de: 'Prešeren-Tag' }, office: 'ljubljana' },
  { date: '2028-04-27', name: { en: 'Day of Uprising Against Occupation', sl: 'Dan upora proti okupatorju', de: 'Tag des Aufstands gegen die Besatzung' }, office: 'ljubljana' },
  { date: '2028-05-01', name: { en: 'Labour Day', sl: 'Praznik dela', de: 'Tag der Arbeit' }, office: 'both' },
  { date: '2028-05-02', name: { en: 'Labour Day Holiday', sl: 'Praznik dela', de: 'Tag der Arbeit' }, office: 'ljubljana' },
  { date: '2028-06-25', name: { en: 'Statehood Day', sl: 'Dan državnosti', de: 'Staatlichkeitstag' }, office: 'ljubljana' },
  { date: '2028-08-15', name: { en: 'Assumption Day', sl: 'Marijino vnebovzetje', de: 'Mariä Himmelfahrt' }, office: 'both' },
  { date: '2028-10-31', name: { en: 'Reformation Day', sl: 'Dan reformacije', de: 'Reformationstag' }, office: 'ljubljana' },
  { date: '2028-11-01', name: { en: 'All Saints\' Day', sl: 'Dan spomina na mrtve', de: 'Allerheiligen' }, office: 'both' },
  { date: '2028-12-25', name: { en: 'Christmas', sl: 'Božič', de: 'Weihnachten' }, office: 'both' },
  { date: '2028-12-26', name: { en: 'Independence Day', sl: 'Dan samostojnosti', de: 'Unabhängigkeitstag' }, office: 'ljubljana' },
  
  // 2029
  { date: '2029-01-01', name: { en: 'New Year\'s Day', sl: 'Novo leto', de: 'Neujahr' }, office: 'ljubljana' },
  { date: '2029-01-02', name: { en: 'New Year Holiday', sl: 'Novoletni praznik', de: 'Neujahrstag' }, office: 'ljubljana' },
  { date: '2029-02-08', name: { en: 'Prešeren Day', sl: 'Prešernov dan', de: 'Prešeren-Tag' }, office: 'ljubljana' },
  { date: '2029-04-27', name: { en: 'Day of Uprising Against Occupation', sl: 'Dan upora proti okupatorju', de: 'Tag des Aufstands gegen die Besatzung' }, office: 'ljubljana' },
  { date: '2029-05-01', name: { en: 'Labour Day', sl: 'Praznik dela', de: 'Tag der Arbeit' }, office: 'both' },
  { date: '2029-05-02', name: { en: 'Labour Day Holiday', sl: 'Praznik dela', de: 'Tag der Arbeit' }, office: 'ljubljana' },
  { date: '2029-06-25', name: { en: 'Statehood Day', sl: 'Dan državnosti', de: 'Staatlichkeitstag' }, office: 'ljubljana' },
  { date: '2029-08-15', name: { en: 'Assumption Day', sl: 'Marijino vnebovzetje', de: 'Mariä Himmelfahrt' }, office: 'both' },
  { date: '2029-10-31', name: { en: 'Reformation Day', sl: 'Dan reformacije', de: 'Reformationstag' }, office: 'ljubljana' },
  { date: '2029-11-01', name: { en: 'All Saints\' Day', sl: 'Dan spomina na mrtve', de: 'Allerheiligen' }, office: 'both' },
  { date: '2029-12-25', name: { en: 'Christmas', sl: 'Božič', de: 'Weihnachten' }, office: 'both' },
  { date: '2029-12-26', name: { en: 'Independence Day', sl: 'Dan samostojnosti', de: 'Unabhängigkeitstag' }, office: 'ljubljana' },
  
  // 2030
  { date: '2030-01-01', name: { en: 'New Year\'s Day', sl: 'Novo leto', de: 'Neujahr' }, office: 'ljubljana' },
  { date: '2030-01-02', name: { en: 'New Year Holiday', sl: 'Novoletni praznik', de: 'Neujahrstag' }, office: 'ljubljana' },
  { date: '2030-02-08', name: { en: 'Prešeren Day', sl: 'Prešernov dan', de: 'Prešeren-Tag' }, office: 'ljubljana' },
  { date: '2030-04-27', name: { en: 'Day of Uprising Against Occupation', sl: 'Dan upora proti okupatorju', de: 'Tag des Aufstands gegen die Besatzung' }, office: 'ljubljana' },
  { date: '2030-05-01', name: { en: 'Labour Day', sl: 'Praznik dela', de: 'Tag der Arbeit' }, office: 'both' },
  { date: '2030-05-02', name: { en: 'Labour Day Holiday', sl: 'Praznik dela', de: 'Tag der Arbeit' }, office: 'ljubljana' },
  { date: '2030-06-25', name: { en: 'Statehood Day', sl: 'Dan državnosti', de: 'Staatlichkeitstag' }, office: 'ljubljana' },
  { date: '2030-08-15', name: { en: 'Assumption Day', sl: 'Marijino vnebovzetje', de: 'Mariä Himmelfahrt' }, office: 'both' },
  { date: '2030-10-31', name: { en: 'Reformation Day', sl: 'Dan reformacije', de: 'Reformationstag' }, office: 'ljubljana' },
  { date: '2030-11-01', name: { en: 'All Saints\' Day', sl: 'Dan spomina na mrtve', de: 'Allerheiligen' }, office: 'both' },
  { date: '2030-12-25', name: { en: 'Christmas', sl: 'Božič', de: 'Weihnachten' }, office: 'both' },
  { date: '2030-12-26', name: { en: 'Independence Day', sl: 'Dan samostojnosti', de: 'Unabhängigkeitstag' }, office: 'ljubljana' },
];

// Munich/Bavaria public holidays (Germany)
const munichHolidays: Holiday[] = [
  // 2025
  { date: '2025-01-01', name: { en: 'New Year\'s Day', sl: 'Novo leto', de: 'Neujahr' }, office: 'munich' },
  { date: '2025-01-06', name: { en: 'Epiphany', sl: 'Sveti trije kralji', de: 'Heilige Drei Könige' }, office: 'munich' },
  { date: '2025-04-18', name: { en: 'Good Friday', sl: 'Veliki petek', de: 'Karfreitag' }, office: 'munich' },
  { date: '2025-04-21', name: { en: 'Easter Monday', sl: 'Velikonočni ponedeljek', de: 'Ostermontag' }, office: 'munich' },
  { date: '2025-05-01', name: { en: 'Labour Day', sl: 'Praznik dela', de: 'Tag der Arbeit' }, office: 'both' },
  { date: '2025-05-29', name: { en: 'Ascension Day', sl: 'Vnebohod', de: 'Christi Himmelfahrt' }, office: 'munich' },
  { date: '2025-06-09', name: { en: 'Whit Monday', sl: 'Binkoštni ponedeljek', de: 'Pfingstmontag' }, office: 'munich' },
  { date: '2025-06-19', name: { en: 'Corpus Christi', sl: 'Božje telo', de: 'Fronleichnam' }, office: 'munich' },
  { date: '2025-08-15', name: { en: 'Assumption Day', sl: 'Marijino vnebovzetje', de: 'Mariä Himmelfahrt' }, office: 'both' },
  { date: '2025-10-03', name: { en: 'German Unity Day', sl: 'Dan nemške enotnosti', de: 'Tag der Deutschen Einheit' }, office: 'munich' },
  { date: '2025-11-01', name: { en: 'All Saints\' Day', sl: 'Dan spomina na mrtve', de: 'Allerheiligen' }, office: 'both' },
  { date: '2025-12-25', name: { en: 'Christmas', sl: 'Božič', de: 'Weihnachten' }, office: 'both' },
  { date: '2025-12-26', name: { en: 'Boxing Day', sl: 'Štefanovo', de: 'Zweiter Weihnachtsfeiertag' }, office: 'munich' },
  
  // 2026
  { date: '2026-01-01', name: { en: 'New Year\'s Day', sl: 'Novo leto', de: 'Neujahr' }, office: 'munich' },
  { date: '2026-01-06', name: { en: 'Epiphany', sl: 'Sveti trije kralji', de: 'Heilige Drei Könige' }, office: 'munich' },
  { date: '2026-04-03', name: { en: 'Good Friday', sl: 'Veliki petek', de: 'Karfreitag' }, office: 'munich' },
  { date: '2026-04-06', name: { en: 'Easter Monday', sl: 'Velikonočni ponedeljek', de: 'Ostermontag' }, office: 'munich' },
  { date: '2026-05-01', name: { en: 'Labour Day', sl: 'Praznik dela', de: 'Tag der Arbeit' }, office: 'both' },
  { date: '2026-05-14', name: { en: 'Ascension Day', sl: 'Vnebohod', de: 'Christi Himmelfahrt' }, office: 'munich' },
  { date: '2026-05-25', name: { en: 'Whit Monday', sl: 'Binkoštni ponedeljek', de: 'Pfingstmontag' }, office: 'munich' },
  { date: '2026-06-04', name: { en: 'Corpus Christi', sl: 'Božje telo', de: 'Fronleichnam' }, office: 'munich' },
  { date: '2026-08-15', name: { en: 'Assumption Day', sl: 'Marijino vnebovzetje', de: 'Mariä Himmelfahrt' }, office: 'both' },
  { date: '2026-10-03', name: { en: 'German Unity Day', sl: 'Dan nemške enotnosti', de: 'Tag der Deutschen Einheit' }, office: 'munich' },
  { date: '2026-11-01', name: { en: 'All Saints\' Day', sl: 'Dan spomina na mrtve', de: 'Allerheiligen' }, office: 'both' },
  { date: '2026-12-25', name: { en: 'Christmas', sl: 'Božič', de: 'Weihnachten' }, office: 'both' },
  { date: '2026-12-26', name: { en: 'Boxing Day', sl: 'Štefanovo', de: 'Zweiter Weihnachtsfeiertag' }, office: 'munich' },
  
  // 2027
  { date: '2027-01-01', name: { en: 'New Year\'s Day', sl: 'Novo leto', de: 'Neujahr' }, office: 'munich' },
  { date: '2027-01-06', name: { en: 'Epiphany', sl: 'Sveti trije kralji', de: 'Heilige Drei Könige' }, office: 'munich' },
  { date: '2027-03-26', name: { en: 'Good Friday', sl: 'Veliki petek', de: 'Karfreitag' }, office: 'munich' },
  { date: '2027-03-29', name: { en: 'Easter Monday', sl: 'Velikonočni ponedeljek', de: 'Ostermontag' }, office: 'munich' },
  { date: '2027-05-01', name: { en: 'Labour Day', sl: 'Praznik dela', de: 'Tag der Arbeit' }, office: 'both' },
  { date: '2027-05-06', name: { en: 'Ascension Day', sl: 'Vnebohod', de: 'Christi Himmelfahrt' }, office: 'munich' },
  { date: '2027-05-17', name: { en: 'Whit Monday', sl: 'Binkoštni ponedeljek', de: 'Pfingstmontag' }, office: 'munich' },
  { date: '2027-05-27', name: { en: 'Corpus Christi', sl: 'Božje telo', de: 'Fronleichnam' }, office: 'munich' },
  { date: '2027-08-15', name: { en: 'Assumption Day', sl: 'Marijino vnebovzetje', de: 'Mariä Himmelfahrt' }, office: 'both' },
  { date: '2027-10-03', name: { en: 'German Unity Day', sl: 'Dan nemške enotnosti', de: 'Tag der Deutschen Einheit' }, office: 'munich' },
  { date: '2027-11-01', name: { en: 'All Saints\' Day', sl: 'Dan spomina na mrtve', de: 'Allerheiligen' }, office: 'both' },
  { date: '2027-12-25', name: { en: 'Christmas', sl: 'Božič', de: 'Weihnachten' }, office: 'both' },
  { date: '2027-12-26', name: { en: 'Boxing Day', sl: 'Štefanovo', de: 'Zweiter Weihnachtsfeiertag' }, office: 'munich' },
  
  // 2028
  { date: '2028-01-01', name: { en: 'New Year\'s Day', sl: 'Novo leto', de: 'Neujahr' }, office: 'munich' },
  { date: '2028-01-06', name: { en: 'Epiphany', sl: 'Sveti trije kralji', de: 'Heilige Drei Könige' }, office: 'munich' },
  { date: '2028-04-14', name: { en: 'Good Friday', sl: 'Veliki petek', de: 'Karfreitag' }, office: 'munich' },
  { date: '2028-04-17', name: { en: 'Easter Monday', sl: 'Velikonočni ponedeljek', de: 'Ostermontag' }, office: 'munich' },
  { date: '2028-05-01', name: { en: 'Labour Day', sl: 'Praznik dela', de: 'Tag der Arbeit' }, office: 'both' },
  { date: '2028-05-25', name: { en: 'Ascension Day', sl: 'Vnebohod', de: 'Christi Himmelfahrt' }, office: 'munich' },
  { date: '2028-06-05', name: { en: 'Whit Monday', sl: 'Binkoštni ponedeljek', de: 'Pfingstmontag' }, office: 'munich' },
  { date: '2028-06-15', name: { en: 'Corpus Christi', sl: 'Božje telo', de: 'Fronleichnam' }, office: 'munich' },
  { date: '2028-08-15', name: { en: 'Assumption Day', sl: 'Marijino vnebovzetje', de: 'Mariä Himmelfahrt' }, office: 'both' },
  { date: '2028-10-03', name: { en: 'German Unity Day', sl: 'Dan nemške enotnosti', de: 'Tag der Deutschen Einheit' }, office: 'munich' },
  { date: '2028-11-01', name: { en: 'All Saints\' Day', sl: 'Dan spomina na mrtve', de: 'Allerheiligen' }, office: 'both' },
  { date: '2028-12-25', name: { en: 'Christmas', sl: 'Božič', de: 'Weihnachten' }, office: 'both' },
  { date: '2028-12-26', name: { en: 'Boxing Day', sl: 'Štefanovo', de: 'Zweiter Weihnachtsfeiertag' }, office: 'munich' },
  
  // 2029
  { date: '2029-01-01', name: { en: 'New Year\'s Day', sl: 'Novo leto', de: 'Neujahr' }, office: 'munich' },
  { date: '2029-01-06', name: { en: 'Epiphany', sl: 'Sveti trije kralji', de: 'Heilige Drei Könige' }, office: 'munich' },
  { date: '2029-03-30', name: { en: 'Good Friday', sl: 'Veliki petek', de: 'Karfreitag' }, office: 'munich' },
  { date: '2029-04-02', name: { en: 'Easter Monday', sl: 'Velikonočni ponedeljek', de: 'Ostermontag' }, office: 'munich' },
  { date: '2029-05-01', name: { en: 'Labour Day', sl: 'Praznik dela', de: 'Tag der Arbeit' }, office: 'both' },
  { date: '2029-05-10', name: { en: 'Ascension Day', sl: 'Vnebohod', de: 'Christi Himmelfahrt' }, office: 'munich' },
  { date: '2029-05-21', name: { en: 'Whit Monday', sl: 'Binkoštni ponedeljek', de: 'Pfingstmontag' }, office: 'munich' },
  { date: '2029-05-31', name: { en: 'Corpus Christi', sl: 'Božje telo', de: 'Fronleichnam' }, office: 'munich' },
  { date: '2029-08-15', name: { en: 'Assumption Day', sl: 'Marijino vnebovzetje', de: 'Mariä Himmelfahrt' }, office: 'both' },
  { date: '2029-10-03', name: { en: 'German Unity Day', sl: 'Dan nemške enotnosti', de: 'Tag der Deutschen Einheit' }, office: 'munich' },
  { date: '2029-11-01', name: { en: 'All Saints\' Day', sl: 'Dan spomina na mrtve', de: 'Allerheiligen' }, office: 'both' },
  { date: '2029-12-25', name: { en: 'Christmas', sl: 'Božič', de: 'Weihnachten' }, office: 'both' },
  { date: '2029-12-26', name: { en: 'Boxing Day', sl: 'Štefanovo', de: 'Zweiter Weihnachtsfeiertag' }, office: 'munich' },
  
  // 2030
  { date: '2030-01-01', name: { en: 'New Year\'s Day', sl: 'Novo leto', de: 'Neujahr' }, office: 'munich' },
  { date: '2030-01-06', name: { en: 'Epiphany', sl: 'Sveti trije kralji', de: 'Heilige Drei Könige' }, office: 'munich' },
  { date: '2030-04-19', name: { en: 'Good Friday', sl: 'Veliki petek', de: 'Karfreitag' }, office: 'munich' },
  { date: '2030-04-22', name: { en: 'Easter Monday', sl: 'Velikonočni ponedeljek', de: 'Ostermontag' }, office: 'munich' },
  { date: '2030-05-01', name: { en: 'Labour Day', sl: 'Praznik dela', de: 'Tag der Arbeit' }, office: 'both' },
  { date: '2030-05-30', name: { en: 'Ascension Day', sl: 'Vnebohod', de: 'Christi Himmelfahrt' }, office: 'munich' },
  { date: '2030-06-10', name: { en: 'Whit Monday', sl: 'Binkoštni ponedeljek', de: 'Pfingstmontag' }, office: 'munich' },
  { date: '2030-06-20', name: { en: 'Corpus Christi', sl: 'Božje telo', de: 'Fronleichnam' }, office: 'munich' },
  { date: '2030-08-15', name: { en: 'Assumption Day', sl: 'Marijino vnebovzetje', de: 'Mariä Himmelfahrt' }, office: 'both' },
  { date: '2030-10-03', name: { en: 'German Unity Day', sl: 'Dan nemške enotnosti', de: 'Tag der Deutschen Einheit' }, office: 'munich' },
  { date: '2030-11-01', name: { en: 'All Saints\' Day', sl: 'Dan spomina na mrtve', de: 'Allerheiligen' }, office: 'both' },
  { date: '2030-12-25', name: { en: 'Christmas', sl: 'Božič', de: 'Weihnachten' }, office: 'both' },
  { date: '2030-12-26', name: { en: 'Boxing Day', sl: 'Štefanovo', de: 'Zweiter Weihnachtsfeiertag' }, office: 'munich' },
];

// Combine all holidays, removing duplicates (holidays marked as 'both' appear in both arrays)
const combinedHolidays = [...slovenianHolidays, ...munichHolidays];
const uniqueHolidaysMap = new Map<string, Holiday>();
combinedHolidays.forEach(holiday => {
  const key = `${holiday.date}-${holiday.office}`;
  // For 'both' holidays, use a single key based on date only
  const uniqueKey = holiday.office === 'both' ? holiday.date : key;
  if (!uniqueHolidaysMap.has(uniqueKey)) {
    uniqueHolidaysMap.set(uniqueKey, holiday);
  }
});
export const allHolidays: Holiday[] = Array.from(uniqueHolidaysMap.values()).sort((a, b) => 
  a.date.localeCompare(b.date)
);

// Get holidays for a specific office
export function getHolidaysForOffice(office: 'ljubljana' | 'munich'): Holiday[] {
  return allHolidays.filter(h => h.office === office || h.office === 'both');
}

// Get upcoming holidays (next 12 months)
export function getUpcomingHolidays(office?: 'ljubljana' | 'munich', limit: number = 20): Holiday[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const holidays = office 
    ? getHolidaysForOffice(office)
    : allHolidays;
  
  return holidays
    .filter(h => {
      const holidayDate = new Date(h.date);
      return holidayDate >= today;
    })
    .slice(0, limit);
}

// Group holidays by date with office information
export interface GroupedHoliday {
  date: string;
  offices: ('ljubljana' | 'munich')[];
  names: {
    ljubljana?: string;
    munich?: string;
  };
  // Deduplicated name (same name in all languages if identical)
  displayName: {
    en: string;
    sl: string;
    de: string;
  };
}

export function getGroupedHolidays(limit: number = 50): GroupedHoliday[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get all upcoming holidays
  const upcoming = allHolidays.filter(h => {
    const holidayDate = new Date(h.date);
    return holidayDate >= today;
  });
  
  // Group by date - collect all holidays for each date
  const dateMap = new Map<string, Holiday[]>();
  upcoming.forEach(holiday => {
    const existing = dateMap.get(holiday.date) || [];
    existing.push(holiday);
    dateMap.set(holiday.date, existing);
  });
  
  // Convert to grouped format
  const grouped: GroupedHoliday[] = [];
  
  dateMap.forEach((holidays, date) => {
    const offices: ('ljubljana' | 'munich')[] = [];
    const names: { ljubljana?: string; munich?: string } = {};
    const nameTranslations: { ljubljana?: Holiday['name']; munich?: Holiday['name'] } = {};
    
    holidays.forEach(holiday => {
      if (holiday.office === 'ljubljana' || holiday.office === 'both') {
        if (!offices.includes('ljubljana')) {
          offices.push('ljubljana');
        }
        names.ljubljana = holiday.name.en;
        nameTranslations.ljubljana = holiday.name;
      }
      if (holiday.office === 'munich' || holiday.office === 'both') {
        if (!offices.includes('munich')) {
          offices.push('munich');
        }
        names.munich = holiday.name.en;
        nameTranslations.munich = holiday.name;
      }
    });
    
    // Determine display name - deduplicate if names are the same
    let displayName: Holiday['name'];
    
    if (offices.length === 1) {
      // Only one office - use its name
      displayName = nameTranslations[offices[0]]!;
    } else {
      // Both offices - check if names are the same
      const ljName = names.ljubljana;
      const muName = names.munich;
      
      if (ljName === muName && nameTranslations.ljubljana && nameTranslations.munich) {
        // Same name in all languages - use one
        displayName = nameTranslations.ljubljana;
      } else {
        // Different names - combine them
        const ljTrans = nameTranslations.ljubljana || { en: '', sl: '', de: '' };
        const muTrans = nameTranslations.munich || { en: '', sl: '', de: '' };
        displayName = {
          en: `${ljTrans.en} / ${muTrans.en}`,
          sl: `${ljTrans.sl} / ${muTrans.sl}`,
          de: `${ljTrans.de} / ${muTrans.de}`,
        };
      }
    }
    
    grouped.push({
      date,
      offices: offices.sort(), // Sort for consistent ordering
      names,
      displayName,
    });
  });
  
  return grouped
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}
