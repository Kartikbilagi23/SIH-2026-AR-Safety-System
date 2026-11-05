import { useLanguage } from "../../context/LanguageContext";
import type { Language } from "../../context/LanguageContext";

const Settings = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div>
      <h1>{t("adminSettings")}</h1>

      <label htmlFor="admin-language">
        {t("chooseLanguage")}
      </label>

      <select
        id="admin-language"
        value={language}
        onChange={(e) =>
          setLanguage(e.target.value as Language)
        }
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="sat">ᱥᱟᱱᱛᱟᱲᱤ</option>
      </select>
    </div>
  );
};

export default Settings;