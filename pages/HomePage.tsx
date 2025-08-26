import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { schuldenmaatjeAvatarPath } from '@/utils/ai/prompts'; // Assuming this is where schuldenmaatjeAvatarPath is defined
import {
    ArrowForwardIcon,
    AttachFileIcon,
    SmartToyIcon,
    ChartBarIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChevronDownIcon
} from '@/components/ui/Icons';
import EmailGeneratorVisual from '@/components/websiteelements/EmailGeneratorVisual';
import Agendavisual from '@/components/websiteelements/agendavisual';
import FactGridVisual from '@/components/websiteelements/FactGridVisual';
import AIChatVisual from '@/components/websiteelements/AIChatVisual';


const FaqItem = ({ q, a }: { q: string, a: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <GlassCard pressed className="!p-0 overflow-hidden">
            <button
                className="w-full flex justify-between items-center text-left p-4 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <h4 className="font-bold text-light-text-primary dark:text-dark-text-primary text-lg">{q}</h4>
                <ChevronDownIcon className={`text-2xl text-brand-accent transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="px-4 pb-4 text-light-text-secondary dark:text-dark-text-secondary font-light prose prose-neutral dark:prose-invert max-w-none">
                        {a}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

const HomePage: React.FC = () => {

    return (
        <div className={`font-sans font-light text-light-text-primary dark:text-dark-text-primary transition-colors duration-300 overflow-x-hidden bg-light-bg dark:bg-dark-bg`}>
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 p-4">
                <GlassCard transparencyLevel="high" className="!p-3 flex items-center justify-between max-w-6xl mx-auto">
                    <Link to="/" className="flex items-center space-x-3">
                        <img src={schuldenmaatjeAvatarPath} alt="Schuldhulpje Logo" className="w-10 h-10 rounded-full" />
                        <div className="flex flex-col">
                            <span className="font-bold text-2xl">Schuldhulpje</span>
                        </div>
                    </Link>
                    <nav className="hidden lg:flex items-center gap-2">
                        <Button as="a" href="#features" variant="ghost">Features</Button>
                        <Button as="a" href="#waarom-schuldhulpje" variant="ghost">Waarom Schuldhulpje?</Button>
                        <Button as="a" href="#blog" variant="ghost">Blog</Button>
                        <Button as="a" href="#faq" variant="ghost">FAQ</Button>
                    </nav>
                    <div className="flex items-center gap-2">
                         <Button as={Link} to="/login" variant="secondary" className="hidden sm:inline-flex">
                            Log In
                        </Button>
                        <Button as={Link} to="/register" variant="primary">
                            Start Gratis
                        </Button>
                    </div>
                </GlassCard>
            </header>

            <main className="pt-24 md:pt-28 lg:pt-32">
                {/* Hero Section */}
                <section className="relative flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                    <div className="relative z-20 max-w-4xl">
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6 leading-tight">
                            Samen naar een<br/>schuldenvrij leven
                        </h1>
                        <p className="text-lg sm:text-xl text-light-text-secondary dark:text-dark-text-secondary mb-2 max-w-2xl mx-auto leading-relaxed">
                            Met Schuldhulpje neem je de eerste stap naar financiële rust.
                        </p>
                        <p className="text-lg sm:text-xl text-light-text-secondary dark:text-dark-text-secondary mb-6 max-w-2xl mx-auto leading-relaxed">
                            <span className="text-brand-accent font-semibold">100% anoniem</span>, ondersteund door AI, en altijd <span className="text-brand-accent font-semibold">gratis</span>.
                        </p>

                        {/* Inline centered hero illustration to match provided screenshot */}
                        <div className="mt-2 -mb-4">
                            <img
                                src="../images/headerschuldhulpje.png"
                                alt="Schuldhulpje illustratie"
                                className="mx-auto w-full max-w-4xl object-contain"
                            />
                        </div>
                    </div>
                </section>

                {/* Logo Section */}
                <section className="py-12 bg-white/50 dark:bg-dark-surface/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8">
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                Vertrouwd door vooraanstaande organisaties
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center justify-items-center">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="w-32 h-12 bg-light-surface dark:bg-dark-surface rounded-lg flex items-center justify-center group transition-all duration-300 hover:scale-105">
                                    {/* Placeholder for partner logos */}
                                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary opacity-50 group-hover:opacity-100">
                                        Logo {i + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Spacer for better visual rhythm */}
                <div className="py-8"></div>

                {/* Why Schuldhulpje Section */}
                <section id="waarom-schuldhulpje" className="py-16 sm:py-24 bg-light-surface/50 dark:bg-dark-surface/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-bold leading-tight">Het Is Tijd voor een Revolutie in Schuldhulp</h2>
                                <p className="mt-6 text-lg text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                                    Traditionele hulp is vaak een drempel. Het is langzaam, intimiderend en voelt als een laatste redmiddel. Schuldhulpje is ontworpen als de allereerste, laagdrempelige stap. Voor iedereen die zelf de touwtjes in handen wil nemen.
                                </p>
                                <div className="mt-8">
                                    <Button as={Link} to="/register" variant="primary" size="lg" className="inline-flex items-center">
                                        Begin Direct
                                        <ArrowForwardIcon className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                                    <img 
                                        src="/images/homepage-hero.webp" 
                                        alt="Schuldhulpje mascotte in een gezellige omgeving"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Features Deep Dive */}
                <section id="features" className="py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
                         <div className="text-center mb-12">
                            <span className="text-sm font-semibold text-brand-accent bg-brand-accent/10 px-4 py-1 rounded-full">FEATURES</span>
                            <h2 className="text-3xl sm:text-4xl font-bold mt-4">Dit Is Hoe We Je Leven Eenvoudiger Maken</h2>
                        </div>
                        {/* Feature 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-3 bg-brand-accent/10 text-brand-accent font-bold px-3 py-1 rounded-full text-sm mb-4">
                                  <AttachFileIcon/> AI Document Scanner
                                </div>
                                <h3 className="text-3xl font-bold leading-tight">Verander die Stapel Post in Pure Duidelijkheid</h3>
                                <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">Die ongeopende envelop van het incassobureau? De eindafrekening van de energiemaatschappij? Stop met piekeren. Maak een foto, upload een PDF en kijk hoe onze AI, aangedreven door Gemini, binnen seconden alle belangrijke info extraheert. Schuldeiser, bedrag, betalingskenmerk - het staat direct goed. Je hoeft zelf niets te typen. Voel de opluchting.</p>
                                <Button variant="secondary" className="mt-6">Leer meer over de scanner →</Button>
                            </div>
                            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-neumorphic-convex-light dark:shadow-neumorphic-convex-dark">
                                {/* IMAGE PLACEHOLDER: Een schermafbeelding of mockup van de app die de scan-functie toont. Links een vage foto van een brief, rechts de app-interface met de geëxtraheerde velden (Schuldeiser: Wehkamp, Bedrag: €2800) netjes ingevuld. */}
                                <div className="aspect-[4/3] rounded-xl overflow-hidden">
                                    <img 
                                        src="/images/aiscanner.png"
                                        alt="AI scanner in actie"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                            <div className="md:order-2">
                                <div className="inline-flex items-center gap-3 bg-brand-accent/10 text-brand-accent font-bold px-3 py-1 rounded-full text-sm mb-4">
                                  <ChartBarIcon/> Visueel Dashboard
                                </div>
                                <h3 className="text-3xl font-bold leading-tight">Een Dashboard dat Rust Brengt, Geen Paniek Zaait</h3>
                                <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">Cijfers kunnen overweldigend zijn. Daarom vertalen we alles naar een helder, visueel verhaal. De donutchart toont je waar je geld heen gaat. De voortgangsbalk viert elke euro die je aflost. En de financiële projectie laat zien dat er een eind aan de tunnel is. Dit is geen overzicht; dit is je commandocentrum voor financiële rust.</p>
                                <Button variant="secondary" className="mt-6">Bekijk live demo →</Button>
                            </div>
                            <div className="md:order-1 bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-neumorphic-convex-light dark:shadow-neumorphic-convex-dark">
                                <div className="aspect-[4/3] rounded-xl overflow-hidden">
                                    <img 
                                        src="images/schuldhulpjelaptop.jpeg" 
                                        alt="Overzichtelijk dashboard" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                        
                         {/* Feature 3 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-3 bg-brand-accent/10 text-brand-accent font-bold px-3 py-1 rounded-full text-sm mb-4">
                                  <SmartToyIcon/> Persoonlijke AI Assistent
                                </div>
                                <h3 className="text-3xl font-bold leading-tight">Je Financiële Sidekick die Nooit Oordeelt</h3>
                                <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">Hoe vraag je om uitstel van betaling? Wat moet je zeggen? Stop met zoeken. Vraag het aan Schuldhulpje. "Stel een e-mail op voor de Belastingdienst waarin ik vraag om een regeling van €100 per maand." De AI schrijft een perfecte, formele mail die je direct kunt gebruiken. Het is jouw coach, tekstschrijver en steunpilaar, 24/7 beschikbaar.</p>
                                <Button variant="secondary" className="mt-6">Ontdek de AI assistent →</Button>
                            </div>
                            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-neumorphic-convex-light dark:shadow-neumorphic-convex-dark">
                                <div className="aspect-[4/3] rounded-xl overflow-hidden">
                                    <img 
                                        src="/images/schuldhulpjediploma.png" 
                                        alt="AI Chat assistent" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Visual demo: Email generator (homepage visualization) */}
                        <div className="text-center">
                            <h3 className="text-2xl font-bold">E-mail Generator (Demo)</h3>
                            <p className="mt-3 text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">Probeer hoe eenvoudig het is om een e-mail te genereren voor een schuld — dit is een visuele, niet-verbonden demo.</p>
                            <div className="mt-8 flex flex-col items-center space-y-6">
                                <EmailGeneratorVisual />
                                <Agendavisual />
                                <FactGridVisual />
                                <AIChatVisual />
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Testimonials */}
                <section className="py-16 sm:py-24 bg-light-surface/50 dark:bg-dark-surface/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold">Wat Gebruikers Zeggen</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <GlassCard className="text-center !p-8">
                                <p className="text-2xl font-bold text-brand-accent">“</p>
                                <p className="italic text-lg text-light-text-primary dark:text-dark-text-primary">Na 10 minuten wist ik eindelijk wat ik moest doen. Dat gevoel is onbetaalbaar.</p>
                                <p className="mt-4 font-bold">- Anja V.</p>
                            </GlassCard>
                            <GlassCard className="text-center !p-8">
                                <p className="text-2xl font-bold text-brand-accent">“</p>
                                <p className="italic text-lg text-light-text-primary dark:text-dark-text-primary">Geen schaamte, gewoon rust en een AI die je écht helpt overzicht te krijgen.</p>
                                <p className="mt-4 font-bold">- Mohammed K.</p>
                            </GlassCard>
                            <GlassCard className="text-center !p-8">
                                <p className="text-2xl font-bold text-brand-accent">“</p>
                                <p className="italic text-lg text-light-text-primary dark:text-dark-text-primary">Dat die brieven eindelijk gestructureerd stonden... ongelofelijk. Ik wou dat ik dit eerder had.</p>
                                <p className="mt-4 font-bold">- Linda de G.</p>
                            </GlassCard>
                        </div>
                    </div>
                </section>


                {/* Blog Section */}
                <section id="blog" className="py-16 sm:py-24 bg-light-surface/50 dark:bg-dark-surface/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold">Laatste Nieuws & Inzichten</h2>
                            <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
                                Tips, updates en verhalen over financiële gezondheid
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Blog Card 1 */}
                            <GlassCard className="group hover:shadow-lg transition-shadow duration-300">
                                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                                    <img 
                                        src="../images/placeholder-blog-1.webp" 
                                        alt="Blog artikel thumbnail"
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <div className="mb-4">
                                    <span className="text-sm font-semibold text-brand-accent">Financiële Tips</span>
                                    <h3 className="mt-2 text-xl font-bold">5 Manieren om Direct te Beginnen met Aflossen</h3>
                                </div>
                                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                                    Praktische tips die je vandaag nog kunt toepassen om je schulden aan te pakken.
                                </p>
                                <Button variant="ghost" className="text-sm">Lees Meer →</Button>
                            </GlassCard>

                            {/* Blog Card 2 */}
                            <GlassCard className="group hover:shadow-lg transition-shadow duration-300">
                                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                                    <img 
                                        src="../images/placeholder-blog-2.webp" 
                                        alt="Blog artikel thumbnail"
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <div className="mb-4">
                                    <span className="text-sm font-semibold text-brand-accent">Succesverhaal</span>
                                    <h3 className="mt-2 text-xl font-bold">Van Stress naar Rust: Sarah's Verhaal</h3>
                                </div>
                                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                                    Hoe één gebruiker in 3 maanden weer grip kreeg op haar financiën.
                                </p>
                                <Button variant="ghost" className="text-sm">Lees Meer →</Button>
                            </GlassCard>

                            {/* Blog Card 3 */}
                            <GlassCard className="group hover:shadow-lg transition-shadow duration-300">
                                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                                    <img 
                                        src="../images/placeholder-blog-3.webp" 
                                        alt="Blog artikel thumbnail"
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <div className="mb-4">
                                    <span className="text-sm font-semibold text-brand-accent">Nieuwe Feature</span>
                                    <h3 className="mt-2 text-xl font-bold">Introductie: Slimme Betalingsherinneringen</h3>
                                </div>
                                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                                    Ontdek hoe onze nieuwe AI-feature je helpt geen deadline meer te missen.
                                </p>
                                <Button variant="ghost" className="text-sm">Lees Meer →</Button>
                            </GlassCard>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-16 sm:py-24">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold">Je Vragen, Onze Antwoorden</h2>
                        </div>
                        <div className="space-y-4">
                            <FaqItem q="Is Schuldhulpje echt 100% gratis?" a={<p>Ja. Onze missie is om zoveel mogelijk mensen te helpen grip te krijgen op hun financiën, ongeacht hun situatie. Daarom zijn alle kernfuncties - het scannen van documenten, het dashboard, en de hulp van de AI-assistent - volledig gratis. We willen de drempel om hulp te zoeken zo laag mogelijk maken. In de toekomst introduceren we mogelijk optionele, geavanceerde premium-functies, maar de basis die je nu nodig hebt, zal altijd gratis blijven.</p>} />
                            <FaqItem q="Zijn mijn financiële gegevens veilig bij jullie?" a={<p>Veiligheid en privacy zijn de fundering van Schuldhulpje. We gebruiken versleuteling van bankkwaliteit voor al je data. Je gesprekken met de AI zijn anoniem en worden alleen gebruikt om jou te helpen. We zullen je persoonlijke informatie nooit verkopen of delen. Jij bent de enige die toegang heeft tot jouw financiële overzicht.</p>} />
                            <FaqItem q="Wat als ik alleen een schoenendoos vol ongeopende brieven heb?" a={<p>Perfect! Dat is precies het startpunt waar Schuldhulpje voor ontworpen is. Je hoeft niets voor te bereiden. Pak de eerste brief, maak een foto, en laat de AI het werk doen. Herhaal dit voor elke brief. Voor je het weet, is die beangstigende stapel veranderd in een helder, georganiseerd overzicht in je dashboard. Geen paniek, geen spreadsheets, gewoon scannen en beginnen.</p>} />
                             <FaqItem q="Vervangt deze app een professionele schuldhulpverlener?" a={<p>Schuldhulpje is een extreem krachtige tool voor zelfredzaamheid en overzicht. Het is de perfecte eerste stap. Voor zeer complexe, problematische schulden is het advies om ook contact op te nemen met je gemeente of een professionele schuldhulpverlener. Schuldhulpje is echter de ideale partner om je voor te bereiden op die gesprekken. Je komt beslagen ten ijs, met een compleet overzicht en een duidelijk beeld van je situatie, waardoor de professionele hulp nog effectiever wordt.</p>} />
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-16 sm:py-24 bg-brand-accent">
                    <div className="max-w-3xl mx-auto text-center px-4">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white">Klaar voor de belangrijkste stap?</h2>
                        <p className="mt-4 text-lg text-white/80">
                            Jouw nieuwe financiële leven begint hier en nu. Geen uitstel meer. Geen stress meer. Neem de controle terug. Je kunt dit, en Schuldhulpje is hier om je bij elke stap te helpen.
                        </p>
                        <Button as={Link} to="/register" size="lg" variant="secondary" className="mt-8 !text-brand-accent !bg-white hover:!bg-gray-200 shadow-2xl">
                            Start Vandaag Nog - Het is Gratis
                        </Button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer id="contact" className="bg-light-surface/50 dark:bg-dark-surface/50 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="col-span-2 md:col-span-1">
                             <Link to="/" className="flex items-center space-x-3 mb-4">
                                <img src={schuldenmaatjeAvatarPath} alt="Schuldhulpje Logo" className="w-10 h-10 rounded-full" />
                                <span className="font-bold text-2xl">Schuldhulpje</span>
                            </Link>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Jouw slimme, stille partner op weg naar financiële vrijheid.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-light-text-primary dark:text-dark-text-primary">Navigatie</h4>
                            <ul className="mt-4 space-y-2 text-sm">
                                <li><a href="#hoe-het-werkt" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-brand-accent">Hoe het werkt</a></li>
                                <li><a href="#features" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-brand-accent">Features</a></li>
                                <li><a href="#faq" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-brand-accent">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-light-text-primary dark:text-dark-text-primary">Support</h4>
                            <ul className="mt-4 space-y-2 text-sm">
                                <li><a href="mailto:hallo@schuldhulpje.nl" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-brand-accent">Contact</a></li>
                                <li><Link to="/help" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-brand-accent">Helpcentrum</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-light-text-primary dark:text-dark-text-primary">Juridisch</h4>
                            <ul className="mt-4 space-y-2 text-sm">
                                <li><Link to="/terms" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-brand-accent">Algemene Voorwaarden</Link></li>
                                <li><Link to="/privacy" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-brand-accent">Privacybeleid</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-light-shadow-dark/20 dark:border-dark-shadow-light/20 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        <p>&copy; {new Date().getFullYear()} Schuldhulpje. Met ❤️ gemaakt om te helpen.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;