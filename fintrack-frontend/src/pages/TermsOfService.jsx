import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-500 text-sm mb-8 transition">
          <ArrowLeft size={16} />
          Nazad
        </Link>

        <h1 className="text-white text-3xl font-bold mb-1">Uslovi korišćenja i Autorska prava</h1>
        <p className="text-slate-500 text-sm mb-10">Poslednje ažurirano: [popuni datum]</p>

        <p className="text-slate-400 text-sm bg-white/5 border border-white/10 rounded-lg px-4 py-3 mb-10">
          Ovo je opšti tekst pripremljen za studentski/portfolio projekat i ne predstavlja pravni savet advokata.
        </p>

        <Section title="Uslovi korišćenja (Terms of Service)">
          <SubTitle>1. Opis usluge</SubTitle>
          <P>
            FinTrack (Pregled ličnih finansija) je alat koji korisnicima omogućava da unose, prate i vizualizuju
            sopstvene finansijske podatke (prihode, rashode, transakcije i slične kategorije) radi ličnog pregleda
            i organizacije finansija.
          </P>

          <SubTitle>2. Ko može da koristi aplikaciju</SubTitle>
          <P>
            Aplikacija je namenjena punoletnim korisnicima. Kreiranjem naloga potvrđujete da imate najmanje 18
            godina ili odgovarajuću zakonsku sposobnost u vašoj jurisdikciji.
          </P>

          <SubTitle>3. Nalog korisnika</SubTitle>
          <P>
            Odgovorni ste za tačnost podataka koje unosite i za čuvanje poverljivosti svojih pristupnih podataka
            (lozinke). Aplikacija zadržava pravo da suspenduje ili ukine nalog u slučaju zloupotrebe, pokušaja
            neovlašćenog pristupa ili kršenja ovih uslova.
          </P>

          <SubTitle>4. Priroda usluge — nije finansijski savet</SubTitle>
          <P>Aplikacija služi isključivo za ličnu evidenciju i organizaciju finansijskih podataka. Aplikacija:</P>
          <Ul items={[
            'ne pruža finansijski, investicioni, poreski niti pravni savet;',
            'ne garantuje tačnost automatskih izračunavanja, kategorizacija ili prikaza u slučaju greške u unosu ili tehničke greške;',
            'nije regulisana finansijska institucija niti bankarska usluga.',
          ]} />
          <P>Sve odluke koje donesete na osnovu podataka prikazanih u aplikaciji su isključivo vaša odgovornost.</P>

          <SubTitle>5. Podaci koje unosite</SubTitle>
          <P>Korisnici mogu uneti realne lične finansijske podatke (npr. iznose transakcija, kategorije potrošnje). Ti podaci:</P>
          <Ul items={[
            'se čuvaju radi pružanja funkcionalnosti aplikacije;',
            'se ne dele sa trećim licima u komercijalne svrhe;',
            'se ne koriste za bilo kakvu analizu izvan svrhe same aplikacije.',
          ]} />

          <SubTitle>6. Ograničenje odgovornosti</SubTitle>
          <P>U najvećoj meri dozvoljenoj zakonom, autori aplikacije ne snose odgovornost za:</P>
          <Ul items={[
            'gubitak podataka usled tehničkog kvara, greške servera ili prekida rada;',
            'odluke korisnika donete na osnovu podataka iz aplikacije;',
            'neovlašćen pristup nalogu usled nepažnje korisnika (npr. deljenje lozinke).',
          ]} />
          <P>Aplikacija se pruža „takva kakva jeste" (as is), bez garancija bilo koje vrste.</P>

          <SubTitle>7. Izmene uslova</SubTitle>
          <P>Autori zadržavaju pravo izmene ovih uslova. O značajnim izmenama korisnici će biti obavešteni u okviru aplikacije.</P>

          <SubTitle>8. Kontakt</SubTitle>
          <P>Za pitanja u vezi sa ovim uslovima, kontaktirajte autore putem GitHub repozitorijuma aplikacije.</P>
        </Section>

        <Section title="Politika privatnosti (kratka verzija)">
          <Ul items={[
            'Podaci koje unesete (transakcije, kategorije, iznosi) čuvaju se u bazi podataka aplikacije radi prikazivanja i obrade unutar samog alata.',
            'Lozinke se čuvaju u heš (hashed) obliku i nisu čitljive u izvornom tekstu.',
            'Podaci se ne prodaju niti dele sa trećim stranama u marketinške svrhe.',
            'Korisnik u svakom trenutku može zatražiti brisanje svog naloga i podataka.',
            'Aplikacija koristi standardne mere zaštite (autentifikacija, enkriptovana komunikacija) u meri u kojoj to dozvoljava infrastruktura na kojoj je hostovana.',
          ]} />
        </Section>

        <Section title="Autorska prava (Copyright)">
          <P className="font-medium text-slate-300">© 2026 Vuk Mandić i Tamara Simić. Sva prava zadržana.</P>
          <P>
            Aplikacija FinTrack (Pregled ličnih finansija), uključujući njen izvorni kod, dizajn i sadržaj,
            razvijena je od strane Vuka Mandića i Tamare Simić kao studentski/portfolio projekat. Neovlašćeno
            kopiranje, distribucija ili komercijalna upotreba bez izričite dozvole autora nije dozvoljena, osim
            u meri predviđenoj licencom repozitorijuma (ako postoji).
          </P>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-white text-xl font-semibold mb-4 pb-2 border-b border-white/10">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function SubTitle({ children }) {
  return <h3 className="text-slate-200 font-medium mt-2">{children}</h3>
}

function P({ children, className = '' }) {
  return <p className={`text-slate-400 text-sm leading-relaxed ${className}`}>{children}</p>
}

function Ul({ items }) {
  return (
    <ul className="flex flex-col gap-1.5 pl-1">
      {items.map((item, i) => (
        <li key={i} className="text-slate-400 text-sm leading-relaxed flex gap-2">
          <span className="text-amber-500 mt-0.5">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
