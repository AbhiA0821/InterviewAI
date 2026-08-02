/**
 * Phonetic Dictionary & ASR Post-Processing Engine
 * Auto-corrects common Speech-to-Text misrecognitions of technical terms
 * to ensure 100% accurate AI question evaluation and transcript logging.
 */

const TECHNICAL_PHONETIC_MAP: Record<string, string> = {
  // Languages & Runtimes
  python: "Python",
  typescript: "TypeScript",
  javascript: "JavaScript",
  "java script": "JavaScript",
  "type script": "TypeScript",
  cplusplus: "C++",
  "c plus plus": "C++",
  csharp: "C#",
  "c sharp": "C#",
  golang: "Go",
  rustlang: "Rust",

  // ML / AI Frameworks
  pytork: "PyTorch",
  pytorch: "PyTorch",
  "pi torch": "PyTorch",
  "pie torch": "PyTorch",
  "tensor flow": "TensorFlow",
  tensorflow: "TensorFlow",
  scikitlearn: "scikit-learn",
  "sci kit learn": "scikit-learn",
  huggingface: "Hugging Face",

  // Frontend & Web
  reactjs: "React",
  "react js": "React",
  "next js": "Next.js",
  nextjs: "Next.js",
  vuejs: "Vue.js",
  "vue js": "Vue.js",
  tailwindcss: "Tailwind CSS",
  "tailwind css": "Tailwind CSS",

  // Backend & Cloud
  fastapi: "FastAPI",
  "fast api": "FastAPI",
  node: "Node.js",
  nodejs: "Node.js",
  "node js": "Node.js",
  expressjs: "Express.js",
  "express js": "Express.js",
  postgress: "PostgreSQL",
  postgres: "PostgreSQL",
  postgresql: "PostgreSQL",
  mongodb: "MongoDB",
  "mongo db": "MongoDB",
  redis: "Redis",
  dynamodb: "DynamoDB",
  kubernetis: "Kubernetes",
  kubernetes: "Kubernetes",
  k8s: "Kubernetes",
  docker: "Docker",
  dockers: "Docker",
  "amazon web services": "AWS",
  aws: "AWS",
  gcp: "GCP",
  azure: "Azure",

  // Engineering & Core Terms
  autocad: "AutoCAD",
  "auto cad": "AutoCAD",
  matlab: "MATLAB",
  solidworks: "SolidWorks",
  "solid works": "SolidWorks",
  ansys: "ANSYS",
  verilog: "Verilog",
  vhdl: "VHDL",
};

/**
 * Normalizes and corrects candidate speech text for technical accuracy.
 */
export function correctTechnicalPhonetics(text: string): string {
  if (!text) return text;
  let corrected = text;

  // Replace phrases/words matching dictionary
  Object.entries(TECHNICAL_PHONETIC_MAP).forEach(([key, canonical]) => {
    const regex = new RegExp(`\\b${key}\\b`, "gi");
    corrected = corrected.replace(regex, canonical);
  });

  return corrected;
}

export default correctTechnicalPhonetics;
