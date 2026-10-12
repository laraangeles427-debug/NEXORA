import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    "https://laraangeles427-debug.github.io"
  ]
}));
app.use(express.json({ limit: "20kb" }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (_req, res) => {
  res.send("NEXORA: servidor educativo activo.");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "NEXORA" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Escribe una pregunta para NEXORA."
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        error: "La pregunta es demasiado larga."
      });
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      instructions:
        "Eres NEXORA, un asistente educativo inclusivo. " +
        "Enseñas educación financiera, contabilidad y tributación, " +
        "con explicaciones claras, amables y adaptadas al nivel del usuario. " +
        "Usa ejemplos sencillos. No inventes leyes, impuestos ni cifras oficiales. " +
        "Cuando una consulta tributaria dependa de normas vigentes de Ecuador, " +
        "indica que deben verificarse en fuentes oficiales. " +
        "No solicites contraseñas, claves bancarias ni datos sensibles.",
      input: message.trim()
    });

    res.json({
      answer: response.output_text
    });
  } catch (error) {
    console.error("Error al responder:", error.message);
    res.status(500).json({
      error: "NEXORA no pudo responder. Inténtalo de nuevo."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`NEXORA está escuchando en el puerto ${PORT}`);
});
