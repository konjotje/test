# Schuldhulpje - Schuldbeheer Applicatie

Een moderne, veilige webapplicatie voor het beheren van persoonlijke schulden, inkomsten en uitgaven. Gebouwd met React, TypeScript, Firebase en Vite.

## 📋 Inhoudsopgave

- [Overzicht](#overzicht)
- [Functies](#functies)
- [Technologie Stack](#technologie-stack)
- [Installatie](#installatie)
- [Configuratie](#configuratie)
- [Gebruik](#gebruik)
- [Beveiliging & Privacy](#beveiliging--privacy)
- [Ontwikkeling](#ontwikkeling)
- [Projectstructuur](#projectstructuur)
- [Contributing](#contributing)
- [Licentie](#licentie)

## 🎯 Overzicht

Schuldhulpje is een gebruiksvriendelijke applicatie die helpt bij het beheren van persoonlijke financiën, met speciale focus op schuldbeheer. De applicatie biedt een overzichtelijk dashboard, betalingsplanning, en AI-assistentie voor financieel advies.

### Belangrijkste voordelen:
- **Veilig**: End-to-end encryptie en GDPR-compliant
- **Gebruiksvriendelijk**: Intuïtieve interface met donkere/lichte modus
- **Responsief**: Werkt perfect op desktop, tablet en mobiel
- **Real-time**: Live updates van alle gegevens
- **AI-powered**: Intelligente financiële assistentie

## ✨ Functies

### 📊 Dashboard
- Overzicht van alle schulden en financiële status
- Interactieve grafieken en statistieken
- Aankomende betalingen kalender
- Activiteitenlog

### 💳 Schuldbeheer
- Toevoegen en beheren van schulden
- Automatische betalingsplannen
- Voortgang tracking
- Contact informatie crediteuren

### 💰 Financieel Beheer
- Inkomsten en uitgaven registratie
- Categorisering van uitgaven
- Maandelijkse en eenmalige transacties
- Financiële projecties

### 🤖 AI Assistent
- Persoonlijk financieel advies
- Vraag & antwoord over schulden
- Strategieën voor schuldenvrij worden
- Geïntegreerd met Gemini AI

### 📱 Gebruikersinterface
- Modern glasmorfisme design
- Donkere en lichte modus
- Volledig responsive
- Toegankelijk (WCAG compliant)

## 🛠 Technologie Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type veiligheid
- **Vite** - Build tool en dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework

### Backend & Database
- **Firebase** - Authentication en Firestore database
- **Google Gemini AI** - AI assistentie

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript Compiler** - Type checking

## 🚀 Installatie

### Vereisten
- **Node.js** (versie 18 of hoger)
- **npm** of **yarn**
- **Firebase project** (voor database en auth)
- **Google Gemini API key** (voor AI functies)

### Stap 1: Repository clonen
```bash
git clone https://github.com/jouw-username/Schuldhulpje.git
cd Schuldhulpje
```

### Stap 2: Dependencies installeren
```bash
npm install
```

### Stap 3: Environment configuratie
```bash
# Kopieer het voorbeeld bestand
cp .env.example .env.local

# Bewerk .env.local en vul je API keys in
nano .env.local
```

### Stap 4: Firebase setup
1. Ga naar [Firebase Console](https://console.firebase.google.com/)
2. Maak een nieuw project aan
3. Activeer Authentication (Email/Password)
4. Activeer Firestore Database
5. Kopieer je Firebase config naar `.env.local`

### Stap 5: Gemini AI setup
1. Ga naar [Google AI Studio](https://aistudio.google.com/)
2. Genereer een API key
3. Voeg de key toe aan `.env.local`

### Stap 6: Applicatie starten
```bash
npm run dev
```

De applicatie is nu beschikbaar op `http://localhost:5173`

## ⚙️ Configuratie

### Environment Variables
Maak een `.env.local` bestand aan met de volgende variabelen:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Firebase Security Rules
Zorg ervoor dat je Firestore security rules correct zijn ingesteld:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Subcollections inherit the same rules
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## 📖 Gebruik

### Account aanmaken
1. Ga naar de registratiepagina
2. Vul je gegevens in (voornaam, achternaam, email, geboortedatum)
3. Maak een veilig wachtwoord aan
4. Verificeer je email adres

### Schuld toevoegen
1. Ga naar de "Schulden" pagina
2. Klik op "Nieuwe schuld toevoegen"
3. Vul alle benodigde gegevens in:
   - Naam schuldeiser
   - Totaalbedrag
   - Omschrijving
   - Contactgegevens (optioneel)
4. Stel een betalingsplan in (optioneel)
5. Sla de schuld op

### Betaling registreren
1. Ga naar de "Betalingen" pagina
2. Bekijk je aankomende betalingen
3. Klik op "Betaling registreren" bij de relevante betaling
4. Bevestig de betaling

### AI Assistent gebruiken
1. Open de AI Assistent (rechter zijbalk op desktop, aparte pagina op mobiel)
2. Stel je vraag over schulden of financiën
3. Ontvang gepersonaliseerd advies gebaseerd op je data

## 🔒 Beveiliging & Privacy

### Gegevensbeveiliging
- **Encryptie**: Alle data wordt versleuteld opgeslagen in Firebase
- **Authentication**: Veilige authenticatie via Firebase Auth
- **Rate limiting**: Bescherming tegen misbruik van API calls
- **Input validatie**: Alle gebruikersinvoer wordt gevalideerd en gesanitized

### Privacy & GDPR
- **Data minimalisatie**: Alleen noodzakelijke gegevens worden opgeslagen
- **Gebruikerscontrole**: Gebruikers hebben volledige controle over hun data
- **Geen tracking**: Geen externe tracking of analytics
- **Lokale opslag**: Thema voorkeuren worden lokaal opgeslagen

### Best Practices
- Gebruik sterke wachtwoorden
- Log regelmatig uit op gedeelde computers
- Controleer je account activiteit regelmatig
- Meld verdachte activiteit direct

## 🛠 Ontwikkeling

### Development server starten
```bash
npm run dev
```

### Build voor productie
```bash
npm run build
```

### Preview productie build
```bash
npm run preview
```

### Type checking
```bash
npx tsc --noEmit
```

### Code Quality
De applicatie gebruikt verschillende tools voor code kwaliteit:

- **TypeScript**: Voor type veiligheid
- **ESLint**: Voor code linting
- **Prettier**: Voor code formatting
- **Error Boundaries**: Voor graceful error handling
- **Custom Hooks**: Voor herbruikbare logica

### Testing
```bash
# Unit tests (wanneer geïmplementeerd)
npm run test

# E2E tests (wanneer geïmplementeerd)
npm run test:e2e
```

## 📁 Projectstructuur

```
Schuldhulpje/
├── public/                 # Statische bestanden
├── src/
│   ├── components/        # React componenten
│   │   ├── ui/           # Herbruikbare UI componenten
│   │   ├── forms/        # Formulier componenten
│   │   ├── charts/       # Grafiek componenten
│   │   └── ai/           # AI gerelateerde componenten
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Pagina componenten
│   ├── services/         # API services
│   ├── utils/            # Utility functies
│   ├── types.ts          # TypeScript type definities
│   ├── firebase.ts       # Firebase configuratie
│   └── App.tsx           # Hoofdcomponent
├── .env.example          # Environment variabelen voorbeeld
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuratie
├── vite.config.ts        # Vite configuratie
└── README.md             # Deze documentatie
```

### Belangrijke bestanden
- `src/types.ts` - Alle TypeScript type definities
- `src/firebase.ts` - Firebase configuratie en initialisatie
- `src/services/FirebaseService.ts` - Database operaties
- `src/utils/validation.ts` - Input validatie functies
- `src/components/ui/ErrorBoundary.tsx` - Error handling
- `src/components/ui/Toast.tsx` - Notification systeem

## 🤝 Contributing

Bijdragen aan dit project zijn welkom! Volg deze stappen:

1. **Fork** het project
2. **Clone** je fork lokaal
3. **Maak** een feature branch (`git checkout -b feature/nieuwe-functie`)
4. **Commit** je wijzigingen (`git commit -m 'Voeg nieuwe functie toe'`)
5. **Push** naar de branch (`git push origin feature/nieuwe-functie`)
6. **Open** een Pull Request

### Development Guidelines
- Schrijf duidelijke commit messages
- Voeg TypeScript types toe voor alle nieuwe code
- Test je wijzigingen grondig
- Volg de bestaande code style
- Documenteer nieuwe functies

## 📄 Licentie

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

## 📞 Support

Voor vragen, bugs of feature requests:

1. **GitHub Issues**: Open een issue in deze repository
2. **Email**: contact@Schuldhulpje.nl (indien beschikbaar)
3. **Documentatie**: Raadpleeg deze README voor veelgestelde vragen

## 🔄 Changelog

### v1.0.0 (Huidige versie)
- ✅ Basis schuldbeheer functionaliteit
- ✅ Firebase authenticatie en database
- ✅ AI assistent integratie
- ✅ Responsive design
- ✅ Donkere/lichte modus
- ✅ Input validatie en error handling
- ✅ Toast notifications
- ✅ Activity logging

### Geplande features
- 📊 Geavanceerde rapportage
- 📱 Progressive Web App (PWA)
- 🔄 Data export/import
- 📧 Email notificaties
- 🏦 Bank integratie

---

**Schuldhulpje** - Jouw partner in financiële vrijheid 💪
