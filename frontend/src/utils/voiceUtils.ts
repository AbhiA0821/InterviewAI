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

  const g = (gender || "").toLowerCase();
  const isFemale = g === "female" || g === "tanya" || g === "riya";

  const femaleKeywords = [
    "neerja", "heera", "veena", "sangeeta", "ananya", "kavya",
    "zira", "hazel", "female", "woman", "girl", "aria", "jenny",
    "catherine", "linda", "samantha", "victoria", "karen", "eva",
    "emma", "amy", "joanna", "susan", "stacy", "nicole"
  ];

  const maleKeywords = [
    "prabhat", "ravi", "rishi", "karan", "male", "guy", "ryan",
    "david", "mark", "george", "steffan", "james", "boy", "man",
    "daniel", "brian", "christopher", "eric", "alexander", "rishi"
  ];

  const matchesAny = (name: string, keywords: string[]) => keywords.some((kw) => name.includes(kw));

  const parse = (v: SpeechSynthesisVoice) => {
    const name = v.name.toLowerCase();
    const lang = (v.lang || "").toLowerCase().replace("_", "-");
    const isIndianLang =
      lang.includes("en-in") ||
      lang.includes("hi-in") ||
      name.includes("india") ||
      name.includes("indian") ||
      name.includes("en-in");
    const isExplicitFemale = matchesAny(name, femaleKeywords);
    const isExplicitMale = matchesAny(name, maleKeywords);
    return { name, lang, isIndianLang, isExplicitFemale, isExplicitMale };
  };

  if (isFemale) {
    // 1. Explicit Female Indian Voice (Neerja, Heera, Veena, Sangeeta)
    const indianFemale = voices.find((v) => {
      const { isIndianLang, isExplicitFemale } = parse(v);
      return isIndianLang && isExplicitFemale;
    });
    if (indianFemale) return indianFemale;

    // 2. Any Indian Voice that is NOT explicitly male
    const indianNonMale = voices.find((v) => {
      const { isIndianLang, isExplicitMale } = parse(v);
      return isIndianLang && !isExplicitMale;
    });
    if (indianNonMale) return indianNonMale;

    // 3. Any Female English Voice
    const englishFemale = voices.find((v) => {
      const { lang, isExplicitFemale } = parse(v);
      return lang.startsWith("en") && isExplicitFemale;
    });
    if (englishFemale) return englishFemale;

    return voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
  } else {
    // Male Voice Selection (STRICT: Never return an explicit female voice)
    // 1. Explicit Male Indian Voice (Prabhat, Ravi, Rishi, Karan)
    const indianMale = voices.find((v) => {
      const { isIndianLang, isExplicitMale } = parse(v);
      return isIndianLang && isExplicitMale;
    });
    if (indianMale) return indianMale;

    // 2. Any Indian Voice that is explicitly NOT female
    const indianNonFemale = voices.find((v) => {
      const { isIndianLang, isExplicitFemale } = parse(v);
      return isIndianLang && !isExplicitFemale;
    });
    if (indianNonFemale) return indianNonFemale;

    // 3. Explicit Male English Voice (Guy, David, Ryan, George, etc.)
    const englishMale = voices.find((v) => {
      const { lang, isExplicitMale, isExplicitFemale } = parse(v);
      return lang.startsWith("en") && isExplicitMale && !isExplicitFemale;
    });
    if (englishMale) return englishMale;

    // 4. Any English Voice that is NOT explicitly female
    const englishNonFemale = voices.find((v) => {
      const { lang, isExplicitFemale } = parse(v);
      return lang.startsWith("en") && !isExplicitFemale;
    });
    if (englishNonFemale) return englishNonFemale;

    return voices[0] || null;
  }
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

