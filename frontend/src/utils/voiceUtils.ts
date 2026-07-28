/**
 * voiceUtils.ts
 * -------------
 * Helper functions for selecting authentic Indian English (en-IN) human voice models
 * for speech synthesis across browser environments (Chrome, Edge, Windows, macOS, Android).
 */

export function getIndianEnglishVoice(
  voices: SpeechSynthesisVoice[],
  gender: "female" | "male" | "male1" | "male2" | string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const isFemale = gender === "female" || gender === "tanya" || gender === "riya";

  const parse = (v: SpeechSynthesisVoice) => {
    const name = v.name.toLowerCase();
    const lang = (v.lang || "").toLowerCase().replace("_", "-");
    const isIndianLang =
      lang.includes("en-in") ||
      lang.includes("hi-in") ||
      name.includes("india") ||
      name.includes("indian") ||
      name.includes("en-in");
    const isNaturalNeural = name.includes("natural") || name.includes("neural") || name.includes("online");
    return { name, lang, isIndianLang, isNaturalNeural };
  };

  // Tier 1: Highest quality Natural / Neural Indian English Voice matching gender
  const tier1Natural = voices.find((v) => {
    const { name, isIndianLang, isNaturalNeural } = parse(v);
    if (!isIndianLang && !name.includes("india")) return false;
    if (isFemale) {
      return (
        name.includes("neerja") ||
        (isNaturalNeural && (name.includes("female") || !name.includes("male")))
      );
    } else {
      return (
        name.includes("prabhat") ||
        (isNaturalNeural && (name.includes("male") || !name.includes("female")))
      );
    }
  });

  if (tier1Natural) return tier1Natural;

  // Tier 2: Standard Indian English Voices matching gender (Neerja, Prabhat, Heera, Veena, Rishi, Ravi, Google Indian English)
  const tier2 = voices.find((v) => {
    const { name, isIndianLang } = parse(v);
    if (isFemale) {
      const matchesFemale =
        name.includes("neerja") ||
        name.includes("heera") ||
        name.includes("veena") ||
        name.includes("sangeeta") ||
        name.includes("ananya") ||
        name.includes("kavya");
      if (matchesFemale) return true;
      if (isIndianLang && (name.includes("female") || name.includes("zira") || !name.includes("male"))) {
        return true;
      }
    } else {
      const matchesMale =
        name.includes("prabhat") ||
        name.includes("ravi") ||
        name.includes("rishi") ||
        name.includes("karan");
      if (matchesMale) return true;
      if (isIndianLang && (name.includes("male") || !name.includes("female"))) {
        return true;
      }
    }
    return false;
  });

  if (tier2) return tier2;

  // Tier 3: Any Indian English voice regardless of gender
  const tier3AnyIndian = voices.find((v) => {
    const { isIndianLang } = parse(v);
    return isIndianLang;
  });

  if (tier3AnyIndian) return tier3AnyIndian;

  // Tier 4: Natural / Neural English fallback
  const tier4Natural = voices.find((v) => {
    const { name, lang } = parse(v);
    return (
      lang.startsWith("en") &&
      (name.includes("natural") || name.includes("neural") || name.includes("google") || name.includes("online"))
    );
  });

  return tier4Natural || voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
}

/**
 * Corrects common speech-to-text (STT) misrecognitions, Indian name/surname phonetics,
 * and technical terms in real-time.
 */
export function correctSpeechPhonetics(rawTranscript: string, candidateName?: string): string {
  if (!rawTranscript) return "";
  let text = rawTranscript;

  // Common phonetic mistranscriptions to actual Indian names/surnames & domain words
  const replacements: [RegExp, string][] = [
    // Candidate Specific Surname & Name Corrections
    [/\babhishek jaipur\b/gi, "Abhishek Aiapure"],
    [/\babhishek aya pure\b/gi, "Abhishek Aiapure"],
    [/\babhishek ai a pure\b/gi, "Abhishek Aiapure"],
    [/\babhishek eye pure\b/gi, "Abhishek Aiapure"],
    [/\babhishek aiapure\b/gi, "Abhishek Aiapure"],
    [/\baiapure\b/gi, "Aiapure"],
    [/\bayapure\b/gi, "Aiapure"],
    [/\baiya pure\b/gi, "Aiapure"],
    [/\beye pure\b/gi, "Aiapure"],

    // General Speech-to-Text tech & domain word cleanup
    [/\bpie thon\b/gi, "Python"],
    [/\bre act\b/gi, "React"],
    [/\bnode j s\b/gi, "Node.js"],
    [/\bfast a p i\b/gi, "FastAPI"],
    [/\bsql\b/gi, "SQL"],
  ];

  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, replacement);
  }

  // If candidate display name is supplied or saved, dynamically match & replace STT errors
  const savedName = candidateName || localStorage.getItem("user_display_name");
  if (savedName) {
    const parts = savedName.trim().split(" ");
    if (parts.length >= 2) {
      const firstName = parts[0];
      const lastName = parts[parts.length - 1];
      const nameRegex = new RegExp(`\\b${firstName}\\s+(jaipur|ayapure|aiya pure|eye pure|jaipure)\\b`, "gi");
      text = text.replace(nameRegex, `${firstName} ${lastName}`);
    }
  }

  return text;
}

