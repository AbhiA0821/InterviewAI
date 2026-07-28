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

  const indianFemaleKeywords = [
    "neerja",
    "heera",
    "veena",
    "sangeeta",
    "kanya",
    "ananya",
    "kavya",
    "kalpana",
    "en-in",
    "india",
  ];
  
  const indianMaleKeywords = [
    "prabhat",
    "ravi",
    "rishi",
    "karan",
    "rohan",
    "abhi",
    "en-in",
    "india",
  ];

  // Helper to parse voice details
  const parse = (v: SpeechSynthesisVoice) => {
    const name = v.name.toLowerCase();
    const lang = (v.lang || "").toLowerCase().replace("_", "-");
    const isExplicitIndian =
      lang.includes("en-in") ||
      lang.includes("hi-in") ||
      name.includes("india") ||
      name.includes("indian") ||
      name.includes("en-in");
    return { name, lang, isExplicitIndian };
  };

  // Tier 1: Authentic Indian English Voice matching requested gender
  const tier1 = voices.find((v) => {
    const { name, isExplicitIndian } = parse(v);

    if (isFemale) {
      const matchesFemaleKeyword =
        name.includes("neerja") ||
        name.includes("heera") ||
        name.includes("veena") ||
        name.includes("sangeeta") ||
        name.includes("kanya") ||
        name.includes("ananya") ||
        name.includes("kavya");
      if (matchesFemaleKeyword) return true;
      if (isExplicitIndian && (name.includes("female") || name.includes("zira") || !name.includes("male"))) {
        return true;
      }
    } else {
      const matchesMaleKeyword =
        name.includes("prabhat") ||
        name.includes("ravi") ||
        name.includes("rishi");
      if (matchesMaleKeyword) return true;
      if (isExplicitIndian && (name.includes("male") || !name.includes("female"))) {
        return true;
      }
    }
    return false;
  });

  if (tier1) return tier1;

  // Tier 2: Any Indian English / Indian voice regardless of gender
  const tier2 = voices.find((v) => {
    const { name, isExplicitIndian } = parse(v);
    if (isExplicitIndian) return true;
    return indianFemaleKeywords.some((k) => name.includes(k)) || indianMaleKeywords.some((k) => name.includes(k));
  });

  if (tier2) return tier2;

  // Tier 3: Fallback - Preferred natural / neural English voices
  const tier3 = voices.find((v) => {
    const { name, lang } = parse(v);
    return (
      lang.startsWith("en") &&
      (name.includes("natural") ||
        name.includes("neural") ||
        name.includes("google") ||
        name.includes("online"))
    );
  });

  return tier3 || voices[0] || null;
}
