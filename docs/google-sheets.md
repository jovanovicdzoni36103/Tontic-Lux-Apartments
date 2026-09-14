# Tabela upita, šta je koja kolona

List se zove `Upiti`. Kolone se popunjavaju same, osim tri koje vodite vi.

| Kolona | Ko upisuje | Šta je |
|---|---|---|
| Vreme upita | skripta | kada je upit stigao |
| Status | vi | Novo, Javljeno, Potvrđeno, Odbijeno, Završeno |
| Ime | gost | |
| Prezime | gost | |
| Telefon | gost | |
| Email | gost | na tu adresu ide potvrda |
| Apartman | gost | 53, 54, Milmari, 53 i 54 zajedno, ili "predložite mi" |
| Dolazak | gost | datum |
| Odlazak | gost | datum |
| Noćenja | skripta | razlika između datuma |
| Odrasli | gost | |
| Deca | gost | |
| Uzrast dece | gost | godine, razdvojene zarezom |
| Ukupno gostiju | skripta | odrasli plus deca |
| Napomena | gost | slobodan tekst iz forme |
| Kako je čuo za nas | gost | ako je izabrao |
| Izvor | skripta | sa koje stranice je poslat upit, i da li je otišao na WhatsApp, Viber ili Booking |
| Poslednji kontakt | vi | datum kada ste se javili |
| Interna napomena | vi | dogovorena cena, avans, šta god vam treba |

## Kako se radi sa tabelom

Novi upit dolazi kao `Novo` i red je žućkast. Kada se javite gostu, prebacite
Status na `Javljeno` i upišite datum u `Poslednji kontakt`. Kada se dogovorite,
stavite `Potvrđeno` i u `Interna napomena` upišite cenu. Boja reda se menja sama.

Status `Potvrđeno` je jedini koji uključuje automatski podsetnik gostu tri dana
pre dolaska, ako ste uključili okidač iz uputstva.

## Ograničenja

Ovo nije kalendar zauzetosti. Tabela beleži ko je pitao i šta ste odgovorili.
Slobodne termine i dalje vodite vi. Ako kasnije bude potrebe za pravim
kalendarom na sajtu, radi se odvojeno i traži stalno održavanje.

Ista adresa može da pošalje najviše tri upita u deset minuta. To je zaštita od
spama, nije greška.
