import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export interface LocaleConfig {
  code: string;
  label: string;
  dir?: "ltr" | "rtl";
}

interface LocalizedInputProps<T extends Record<string, string>> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  locales: LocaleConfig[];
  placeholder?: string | Record<keyof T, string>;
  textarea?: boolean;
  rows?: number;
  className?: string;
  required?: boolean;
  layout?: "tabs" | "grid" | "column";
}

export function LocalizedInput<T extends Record<string, string>>({
  label,
  value,
  onChange,
  locales,
  placeholder,
  textarea = false,
  rows = 3,
  className,
  required = false,
  layout = "tabs",
}: LocalizedInputProps<T>) {
  // 1. Delete the global counter. Use the native hook.
  const baseId = useId();

  const handleChange = (lang: keyof T, text: string) => {
    onChange({ ...value, [lang]: text } as T);
  };

  const getPlaceholder = (lang: keyof T) => {
    if (!placeholder) return "";
    if (typeof placeholder === "string") return placeholder;
    return placeholder[lang] || "";
  };

  const InputComponent = textarea ? Textarea : Input;

  if (layout === "grid" || layout === "column") {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label className="font-semibold">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <div
          className={
            layout === "grid"
              ? "grid gap-4 sm:grid-cols-3"
              : "flex flex-col gap-4"
          }
        >
          {locales.map(({ code, label: langLabel, dir }) => (
            <div key={code} className="space-y-2">
              <Label
                className={`text-xs text-muted-foreground ${dir === "rtl" ? "block text-right" : ""}`}
                htmlFor={`${baseId}-${code}`}
              >
                {langLabel}
              </Label>
              <InputComponent
                id={`${baseId}-${code}`}
                value={value[code] || ""}
                dir={dir}
                onChange={(e) => handleChange(code, e.target.value)}
                placeholder={getPlaceholder(code)}
                rows={textarea ? rows : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label
        htmlFor={`${baseId}-${locales[0]?.code}`}
        className="text-sm font-medium"
      >
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      <Tabs defaultValue={locales[0]?.code} className="w-full">
        {/* Dynamically size the tabs based on the number of locales provided */}
        <TabsList
          className="grid w-full h-8"
          style={{
            gridTemplateColumns: `repeat(${locales.length}, minmax(0, 1fr))`,
          }}
        >
          {locales.map(({ code, label: langLabel }) => (
            <TabsTrigger key={code} value={code} className="text-xs">
              {langLabel}
            </TabsTrigger>
          ))}
        </TabsList>

        {locales.map(({ code, dir }) => (
          <TabsContent key={code} value={code} className="mt-2">
            <InputComponent
              id={`${baseId}-${code}`}
              value={value[code] || ""}
              dir={dir}
              onChange={(e) => handleChange(code, e.target.value)}
              placeholder={getPlaceholder(code)}
              rows={textarea ? rows : undefined}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
