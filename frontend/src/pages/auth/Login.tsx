
import {
    Eye,
    EyeOff,
    ShieldCheck,
    LockKeyhole,
    CheckCircle2,
} from "lucide-react";
import {
    useEffect,
    useRef,
    useState,
    type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

type Language = "en" | "hi" | "sat";

const translations = {
    en: {
        government: "Government of India | Government Portal",
        skip: "Skip to Main Content",
        tagline: "Safety • Training • Certification",
        portal: "SAFETY TRAINING PORTAL",
        heroTitle: "Building a safer workforce.",
        heroDescription:
            "Access vocational safety training, assessments and certification through a secure digital platform.",
        benefits: [
            "Secure digital access",
            "Protected training records",
            "Verified certification",
        ],
        signIn: "Sign in",
        signInDescription: "Access your training dashboard",
        email: "Email Address",
        emailPlaceholder: "Enter your email address",
        password: "Password",
        passwordPlaceholder: "Enter your password",
        forgotPassword: "Forgot password?",
        submit: "Sign In",
        submitting: "Signing in...",
        security: "Your credentials are securely protected.",
        invalid: "Invalid email or password.",
        privacy: "Privacy Policy",
        terms: "Terms of Use",
        help: "Help",
        contact: "Contact",
        copyright: "© 2026 SurakshaSetu. All rights reserved.",
        quote: "Safety is not a choice. It is a responsibility.",
        quoteSource: "Safety begins with you.",
    },
    hi: {
        government: "भारत सरकार | सरकारी पोर्टल",
        skip: "मुख्य सामग्री पर जाएँ",
        tagline: "सुरक्षा • प्रशिक्षण • प्रमाणन",
        portal: "सुरक्षा प्रशिक्षण पोर्टल",
        heroTitle: "आइए, एक सुरक्षित कार्यबल बनाएँ।",
        heroDescription:
            "सुरक्षित डिजिटल प्लेटफ़ॉर्म के माध्यम से व्यावसायिक सुरक्षा प्रशिक्षण, मूल्यांकन और प्रमाणन प्राप्त करें।",
        benefits: [
            "सुरक्षित डिजिटल पहुँच",
            "प्रशिक्षण रिकॉर्ड सुरक्षित",
            "प्रमाणित योग्यता",
        ],
        signIn: "लॉगिन करें",
        signInDescription: "अपने प्रशिक्षण डैशबोर्ड पर जाएँ",
        email: "ईमेल पता",
        emailPlaceholder: "अपना ईमेल पता दर्ज करें",
        password: "पासवर्ड",
        passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
        forgotPassword: "पासवर्ड भूल गए?",
        submit: "लॉगिन करें",
        submitting: "लॉगिन हो रहा है...",
        security: "आपकी लॉगिन जानकारी सुरक्षित है।",
        invalid: "ईमेल या पासवर्ड सही नहीं है।",
        privacy: "गोपनीयता नीति",
        terms: "उपयोग की शर्तें",
        help: "सहायता",
        contact: "संपर्क",
        copyright: "© 2026 SurakshaSetu. सर्वाधिकार सुरक्षित।",
        quote: "सुरक्षा कोई विकल्प नहीं, हमारी ज़िम्मेदारी है।",
        quoteSource: "सुरक्षा की शुरुआत आपसे होती है।",
    },
    sat: {
        government: "ᱵᱷᱟᱨᱚᱛ ᱥᱚᱨᱠᱟᱨ | ᱥᱚᱨᱠᱟᱨᱤ ᱯᱚᱨᱴᱟᱞ",
        skip: "ᱢᱩᱞ ᱠᱚᱱᱴᱮᱱᱴ ᱛᱮ ᱪᱟᱞᱟᱜ ᱢᱮ",
        tagline: "ᱥᱩᱨᱠᱷᱭᱟ • ᱴᱨᱮᱱᱤᱝ • ᱥᱟᱨᱴᱤᱯᱷᱤᱠᱮᱴ",
        portal: "ᱥᱩᱨᱠᱷᱭᱟ ᱴᱨᱮᱱᱤᱝ ᱯᱚᱨᱴᱟᱞ",
        heroTitle: "ᱥᱩᱨᱠᱷᱭᱤᱛ ᱠᱟᱢᱤᱭᱟᱹ ᱫᱟᱞ ᱛᱮᱭᱟᱨ ᱢᱮ᱾",
        heroDescription:
            "ᱥᱩᱨᱠᱷᱭᱤᱛ ᱰᱤᱡᱤᱴᱟᱞ ᱯᱞᱟᱴᱯᱷᱚᱨᱢ ᱛᱮ ᱠᱟᱢᱤ ᱥᱚᱢᱵᱚᱱᱫᱷᱤᱛ ᱥᱩᱨᱠᱷᱭᱟ ᱴᱨᱮᱱᱤᱝ, ᱢᱩᱞᱭᱟᱸᱠᱚᱱ ᱟᱨ ᱥᱟᱨᱴᱤᱯᱷᱤᱠᱮᱴ ᱧᱟᱢ ᱢᱮ᱾",
        benefits: [
            "ᱥᱩᱨᱠᱷᱭᱤᱛ ᱰᱤᱡᱤᱴᱟᱞ ᱵᱚᱞᱚᱜ",
            "ᱴᱨᱮᱱᱤᱝ ᱨᱮᱠᱚᱨᱰ ᱥᱩᱨᱠᱷᱭᱤᱛ",
            "ᱯᱨᱚᱢᱟᱱᱤᱛ ᱥᱟᱨᱴᱤᱯᱷᱤᱠᱮᱴ",
        ],
        signIn: "ᱵᱚᱞᱚᱜ ᱢᱮ",
        signInDescription: "ᱟᱢᱟᱜ ᱴᱨᱮᱱᱤᱝ ᱰᱮᱥᱵᱚᱨᱰ ᱛᱮ ᱪᱟᱞᱟᱜ ᱢᱮ",
        email: "ᱤᱢᱮᱞ ᱴᱷᱤᱠᱟᱱᱟ",
        emailPlaceholder: "ᱟᱢᱟᱜ ᱤᱢᱮᱞ ᱴᱷᱤᱠᱟᱱᱟ ᱟᱹᱲᱟᱜ ᱢᱮ",
        password: "ᱯᱟᱥᱣᱟᱨᱰ",
        passwordPlaceholder: "ᱟᱢᱟᱜ ᱯᱟᱥᱣᱟᱨᱰ ᱟᱹᱲᱟᱜ ᱢᱮ",
        forgotPassword: "ᱯᱟᱥᱣᱟᱨᱰ ᱵᱷᱩᱞ ᱠᱮᱫᱟ?",
        submit: "ᱵᱚᱞᱚᱜ ᱢᱮ",
        submitting: "ᱵᱚᱞᱚᱜ ᱠᱟᱱᱟ...",
        security: "ᱟᱢᱟᱜ ᱞᱚᱜᱤᱱ ᱥᱚᱫᱷᱚᱨ ᱥᱩᱨᱠᱷᱭᱤᱛ ᱢᱮᱱᱟᱜᱼᱟ᱾",
        invalid: "ᱤᱢᱮᱞ ᱵᱟᱝᱠᱷᱟᱱ ᱯᱟᱥᱣᱟᱨᱰ ᱵᱟᱝ ᱥᱟᱹᱠᱷᱭᱟᱹᱛ ᱠᱟᱱᱟ᱾",
        privacy: "ᱜᱚᱯᱚᱱᱤᱭᱛᱟ ᱱᱤᱛᱤ",
        terms: "ᱵᱮᱵᱷᱟᱨ ᱨᱮᱭᱟᱜ ᱪᱷᱟᱸᱪ",
        help: "ᱜᱚᱲᱚ",
        contact: "ᱥᱚᱢᱵᱚᱱᱫᱷ",
        copyright: "© 2026 SurakshaSetu. ᱡᱚᱛᱚ ᱟᱹᱭᱩᱨ ᱥᱩᱨᱠᱷᱭᱤᱛ᱾",
        quote: "ᱥᱩᱨᱠᱷᱭᱟ ᱫᱚ ᱵᱟᱛᱟᱣ ᱵᱟᱝ, ᱥᱟᱸᱜᱤᱛ ᱡᱤᱢᱼᱢᱟᱫᱟᱨᱤ ᱠᱟᱱᱟ᱾",
        quoteSource: "ᱥᱩᱨᱠᱷᱭᱟ ᱫᱚ ᱟᱢ ᱠᱷᱚᱱ ᱮᱦᱚᱵ ᱠᱟᱱᱟ᱾",
    },
} as const;

const quotes: Record<Language, string[]> = {
    en: [
        "Safety is not a choice. It is a responsibility.",
        "A safe worker is a strong workforce.",
        "Safety begins with you.",
    ],
    hi: [
        "सुरक्षा कोई विकल्प नहीं, हमारी ज़िम्मेदारी है।",
        "सुरक्षित कर्मचारी ही सशक्त कार्यबल है।",
        "सुरक्षा की शुरुआत आपसे होती है।",
    ],
    sat: [
        "ᱥᱩᱨᱠᱷᱭᱟ ᱫᱚ ᱵᱟᱛᱟᱣ ᱵᱟᱝ, ᱥᱟᱸᱜᱤᱛ ᱡᱤᱢᱼᱢᱟᱫᱟᱨᱤ ᱠᱟᱱᱟ᱾",
        "ᱥᱩᱨᱠᱷᱭᱤᱛ ᱠᱟᱢᱤᱭᱟᱹ ᱫᱚᱥᱟᱨ ᱢᱟᱨᱟᱝ ᱫᱟᱞ ᱠᱟᱱᱟ᱾",
        "ᱥᱩᱨᱠᱷᱭᱟ ᱫᱚ ᱟᱢ ᱠᱷᱚᱱ ᱮᱦᱚᱵ ᱠᱟᱱᱟ᱾",
    ],
};
const languageOrder: Language[] = ["en", "hi", "sat"];

// EN → HI → SAT for each quote, one after another
const tickerItems = quotes.en.flatMap((_, i) =>
    languageOrder.map((lang) => ({ lang, text: quotes[lang][i] }))
);

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const mainRef = useRef<HTMLElement>(null);

    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem("suraksha-language");
        return saved === "hi" || saved === "sat" ? saved : "en";
    });
    const [fontScale, setFontScale] = useState(1);
    //   const [quoteIndex, setQuoteIndex] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const t = translations[language];
    useEffect(() => {
        localStorage.setItem("suraksha-language", language);
        // setQuoteIndex(0);
    }, [language]);

    //   useEffect(() => {
    //     const interval = window.setInterval(() => {
    //       setQuoteIndex((current) => (current + 1) % quotes[language].length);
    //     }, 5000);

    //     return () => window.clearInterval(interval);
    //   }, [language]);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const loggedInUser = await login({ email, password });

            if (loggedInUser.role === "ADMIN") {
                navigate("/admin/overview");
            } else {
                navigate("/worker/dashboard");
            }
        } catch (err: unknown) {
            console.error(err);
            setError(t.invalid);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="gov-login-page"
            style={{ "--font-scale": fontScale } as React.CSSProperties}
            lang={language === "hi" ? "hi" : language === "sat" ? "sat" : "en"}
        >
            <div className="top-strip">
                <div className="top-strip-inner">
                    <span>{t.government}</span>

                    <div className="top-links">
                        <button
                            type="button"
                            onClick={() => mainRef.current?.scrollIntoView({ behavior: "smooth" })}
                        >
                            {t.skip}
                        </button>

                        <div className="language-controls" aria-label="Choose language">
                            <button
                                type="button"
                                className={language === "en" ? "active" : ""}
                                aria-pressed={language === "en"}
                                onClick={() => setLanguage("en")}
                            >
                                EN
                            </button>
                            <button
                                type="button"
                                className={language === "hi" ? "active" : ""}
                                aria-pressed={language === "hi"}
                                onClick={() => setLanguage("hi")}
                            >
                                हिंदी
                            </button>
                            <button
                                type="button"
                                className={language === "sat" ? "active" : ""}
                                aria-pressed={language === "sat"}
                                onClick={() => setLanguage("sat")}
                            >
                                SAT
                            </button>
                        </div>

                        <div className="font-controls" aria-label="Font size">
                            <button
                                type="button"
                                onClick={() =>
                                    setFontScale((size) => Math.max(0.85, +(size - 0.1).toFixed(2)))
                                }
                                aria-label="Decrease font size"
                                title="Decrease font size"
                            >
                                A−
                            </button>
                            <button
                                type="button"
                                onClick={() => setFontScale(1)}
                                aria-label="Reset font size"
                                title="Reset font size"
                            >
                                A
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setFontScale((size) => Math.min(1.3, +(size + 0.1).toFixed(2)))
                                }
                                aria-label="Increase font size"
                                title="Increase font size"
                            >
                                A+
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <header className="gov-header">
                <div className="header-inner">
                    <div className="brand-section">
                        <div className="brand-mark">
                            <ShieldCheck size={34} />
                        </div>
                        <div>
                            <h1>SurakshaSetu</h1>
                            <p>Vocational Safety Training Platform</p>
                        </div>
                    </div>
                    <div className="header-right">{t.tagline}</div>
                </div>
            </header>

            <div className="tricolor-line">
                <span />
                <span />
                <span />
            </div>

            <main className="login-main" id="main-content" ref={mainRef} tabIndex={-1}>
                <div className="login-container">
                    <section className="login-info">
                        <p className="portal-label">{t.portal}</p>
                        <h2>{t.heroTitle}</h2>
                        <p className="info-description">{t.heroDescription}</p>

                        <div className="info-points">
                            {/* <div>
                                <ShieldCheck size={20} />
                                <span>{t.benefits[0]}</span>
                            </div>
                            <div>
                                <LockKeyhole size={20} />
                                <span>{t.benefits[1]}</span>
                            </div> */}
                            <div>
                                <CheckCircle2 size={20} />
                                <span>{t.benefits[2]}</span>
                            </div>
                        </div>
                        <div className="news-ticker" role="region" aria-label="Safety messages">
                            <span className="news-ticker-label">
                                <ShieldCheck size={14} />
                                SAFETY FIRST
                            </span>

                            <div className="news-ticker-viewport">
                                <div className="news-ticker-track">
                                    {[0, 1].map((copy) => (
                                        <div className="news-ticker-group" key={copy} aria-hidden={copy === 1}>
                                            {tickerItems.map((item, i) => (
                                                <span className="news-ticker-item" lang={item.lang} key={i}>
                                                    {item.text}
                                                </span>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* 
                        <div className="safety-ticker" aria-live="polite" aria-atomic="true">
                            <span className="ticker-icon">
                                <ShieldCheck size={20} />
                            </span>
                            <div className="ticker-copy">
                                <span className="ticker-label">SAFETY FIRST</span>
                                <p key={`${language}-${quoteIndex}`}>
                                    “{quotes[language][quoteIndex]}”
                                </p>
                            </div>
                        </div> */}
                    </section>

                    <section className="login-card" aria-labelledby="login-title">
                        <div className="login-card-header">
                            <div className="login-icon">
                                <LockKeyhole size={25} />
                            </div>
                            <div>
                                <h2 id="login-title">{t.signIn}</h2>
                                <p>{t.signInDescription}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">{t.email}</label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="username"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder={t.emailPlaceholder}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <div className="password-label">
                                    <label htmlFor="password">{t.password}</label>
                                    <button type="button" className="forgot-password">
                                        {t.forgotPassword}
                                    </button>
                                </div>

                                <div className="password-input">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder={t.passwordPlaceholder}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((visible) => !visible)}
                                        className="password-toggle"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="form-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="login-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? t.submitting : t.submit}
                            </button>
                        </form>

                        <div className="security-note">
                            <LockKeyhole size={15} />
                            <span>{t.security}</span>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="gov-footer">
                <div className="footer-inner">
                    <div>
                        <strong>SurakshaSetu</strong>
                        <span>Vocational Safety Training Platform</span>
                    </div>
                    <div className="footer-links">
                        <span>{t.privacy}</span>
                        <span>{t.terms}</span>
                        <span>{t.help}</span>
                        <span>{t.contact}</span>
                    </div>
                </div>
                <div className="footer-bottom">{t.copyright}</div>
            </footer>
        </div>
    );
};

export default Login;
