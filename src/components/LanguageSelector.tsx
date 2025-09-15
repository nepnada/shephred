import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export const LanguageSelector = () => {
  const { language, setLanguage, t } = useTranslation();

  const languages = [
    { code: "ar", name: t('language.arabic'), flag: "🇲🇦" },
    { code: "en", name: t('language.english'), flag: "🇺🇸" },
    { code: "darija", name: t('language.darija'), flag: "🇲🇦" },
  ];

  const handleLanguageChange = (newLanguage: 'ar' | 'en' | 'darija') => {
    setLanguage(newLanguage);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};