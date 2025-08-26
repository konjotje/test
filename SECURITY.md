# Security Policy

## Veiligheidsbeleid Schuldhulpje

Wij nemen de veiligheid van Schuldhulpje en de gegevens van onze gebruikers zeer serieus. Dit document beschrijft ons veiligheidsbeleid en hoe u beveiligingsproblemen kunt rapporteren.

## 🔒 Beveiligingsmaatregelen

### Data Beveiliging
- **Encryptie**: Alle gebruikersgegevens worden versleuteld opgeslagen in Firebase Firestore
- **Authenticatie**: Veilige authenticatie via Firebase Authentication
- **Autorisatie**: Gebruikers hebben alleen toegang tot hun eigen gegevens
- **Transport Security**: Alle communicatie verloopt via HTTPS/TLS

### Input Validatie
- Alle gebruikersinvoer wordt gevalideerd en gesanitized
- Bescherming tegen XSS (Cross-Site Scripting) aanvallen
- Bescherming tegen SQL injection (niet van toepassing, maar best practices gevolgd)
- Rate limiting op API calls

### Privacy & GDPR
- **Data minimalisatie**: Alleen noodzakelijke gegevens worden verzameld
- **Gebruikerscontrole**: Gebruikers hebben volledige controle over hun gegevens
- **Geen tracking**: Geen externe tracking of analytics cookies
- **Lokale opslag**: Alleen thema voorkeuren worden lokaal opgeslagen

## 🛡️ Ondersteunde Versies

Wij ondersteunen de volgende versies met beveiligingsupdates:

| Versie | Ondersteund        |
| ------ | ------------------ |
| 1.x.x  | ✅ Volledig        |
| 0.x.x  | ❌ Niet meer       |

## 🚨 Beveiligingsproblemen Rapporteren

Als u een beveiligingsprobleem ontdekt, volg dan deze stappen:

### 1. **Rapporteer Verantwoordelijk**
- **NIET** publiekelijk rapporteren via GitHub Issues
- Stuur een email naar: security@schuldhulpje.nl
- Gebruik PGP encryptie indien mogelijk (sleutel beschikbaar op verzoek)

### 2. **Informatie om te Verstrekken**
- Beschrijving van het beveiligingsprobleem
- Stappen om het probleem te reproduceren
- Mogelijke impact van het probleem
- Voorgestelde oplossing (indien van toepassing)

### 3. **Reactietijd**
- **Bevestiging**: Binnen 24 uur
- **Eerste analyse**: Binnen 72 uur
- **Status update**: Wekelijks tot het probleem is opgelost

### 4. **Disclosure Policy**
Wij volgen een verantwoordelijke disclosure policy:
- 90 dagen voor het publiek maken van het probleem
- Eerder indien een patch beschikbaar is
- Coördinatie met de rapporteur over timing

## 🏆 Responsible Disclosure

Wij waarderen verantwoordelijke beveiligingsonderzoekers en bieden:

### Hall of Fame
Erkende beveiligingsonderzoekers worden vermeld in onze Hall of Fame (met toestemming).

### Beloning
- **Kritieke problemen**: €500 - €1000
- **Hoge problemen**: €200 - €500
- **Gemiddelde problemen**: €50 - €200
- **Lage problemen**: Erkenning en dankbaarheid

*Beloningen zijn afhankelijk van de ernst en impact van het probleem.*

## 🔍 Scope

### In Scope
- Schuldhulpje webapplicatie (schuldhulpje.nl)
- API endpoints
- Authenticatie en autorisatie
- Data lekkage
- XSS, CSRF, en andere web vulnerabilities
- Privilege escalation

### Out of Scope
- Social engineering
- Physical attacks
- DoS/DDoS attacks
- Spam of phishing
- Issues die al bekend zijn
- Third-party services (Firebase, Google, etc.)

## 🛠️ Beveiligingsbest Practices voor Ontwikkelaars

### Code Review
- Alle code wordt gereviewed door minimaal één andere ontwikkelaar
- Automatische security scans in CI/CD pipeline
- Dependency vulnerability scanning

### Environment Security
- Productie en development omgevingen zijn gescheiden
- Environment variabelen voor gevoelige configuratie
- Geen hardcoded secrets in de code

### Monitoring
- Logging van beveiligingsgerelateerde events
- Monitoring van ongebruikelijke activiteit
- Alerting bij verdachte patronen

## 📚 Beveiligingsrichtlijnen voor Gebruikers

### Wachtwoord Beveiliging
- Gebruik sterke, unieke wachtwoorden
- Overweeg het gebruik van een password manager
- Verander uw wachtwoord bij vermoeden van compromittering

### Account Beveiliging
- Log uit op gedeelde computers
- Controleer regelmatig uw account activiteit
- Meld verdachte activiteit direct

### Data Beveiliging
- Deel uw inloggegevens nooit met anderen
- Gebruik alleen vertrouwde netwerken
- Houd uw browser up-to-date

## 📞 Contact

Voor beveiligingsgerelateerde vragen:
- **Email**: security@schuldhulpje.nl
- **Response tijd**: Binnen 24 uur tijdens werkdagen

Voor algemene vragen:
- **Email**: support@schuldhulpje.nl
- **GitHub Issues**: Voor niet-beveiligingsgerelateerde problemen

## 📋 Compliance

Schuldhulpje voldoet aan:
- **GDPR** (General Data Protection Regulation)
- **AVG** (Algemene Verordening Gegevensbescherming)
- **OWASP** Top 10 beveiligingsrichtlijnen
- **Web Content Accessibility Guidelines (WCAG)**

## 🔄 Updates

Dit beveiligingsbeleid wordt regelmatig bijgewerkt. Laatste update: December 2024

---

**Bedankt voor het helpen om Schuldhulpje veilig te houden! 🔒**