import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import multer from "multer";
import sharp from "sharp";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import ffmpeg from "fluent-ffmpeg";
import { Document, Packer, Paragraph, TextRun, Header, Footer, AlignmentType } from "docx";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Image Watermarking
  app.post("/api/process/image", upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) throw new Error("No file uploaded");
      const { text, fontSize, color, opacity, x, y } = req.body;
      
      const image = sharp(req.file.path);
      const metadata = await image.metadata();
      
      const svgText = `
        <svg width="${metadata.width}" height="${metadata.height}">
          <style>
            .title { fill: ${color || 'white'}; font-size: ${fontSize || 40}px; font-weight: bold; font-family: sans-serif; opacity: ${opacity || 0.5}; }
          </style>
          <text x="${x || '50%'}" y="${y || '50%'}" text-anchor="middle" class="title">${text || 'WatermarkX'}</text>
        </svg>
      `;

      const buffer = await image
        .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
        .toBuffer();

      fs.unlinkSync(req.file.path); // Clean up
      res.set("Content-Type", "image/png");
      res.send(buffer);
    } catch (error: any) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: error.message });
    }
  });

  // PDF Watermarking
  app.post("/api/process/pdf", upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) throw new Error("No file uploaded");
      const { text, fontSize, opacity } = req.body;

      const pdfData = fs.readFileSync(req.file.path);
      const pdfDoc = await PDFDocument.load(pdfData);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawText(text || "WatermarkX", {
          x: width / 4,
          y: height / 2,
          size: parseInt(fontSize) || 50,
          font,
          color: rgb(0, 0, 0),
          opacity: parseFloat(opacity) || 0.3,
          rotate: { type: 'degrees', angle: 45 } as any
        });
      }

      const pdfBytes = await pdfDoc.save();
      fs.unlinkSync(req.file.path);
      res.set("Content-Type", "application/pdf");
      res.send(Buffer.from(pdfBytes));
    } catch (error: any) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: error.message });
    }
  });

  // Video Watermarking (Simplified version)
  app.post("/api/process/video", upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) throw new Error("No file uploaded");
      const { text } = req.body;
      const outputPath = path.join(uploadDir, `watermarked-${Date.now()}.mp4`);

      ffmpeg(req.file.path)
        .videoFilters(`drawtext=text='${text || "WatermarkX"}':fontcolor=white:fontsize=24:box=1:boxcolor=black@0.5:boxborderw=5:x=(w-text_w)/2:y=(h-text_h)/2`)
        .on("end", () => {
          res.download(outputPath, () => {
            if (req.file) fs.unlinkSync(req.file.path);
            fs.unlinkSync(outputPath);
          });
        })
        .on("error", (err) => {
          if (req.file) fs.unlinkSync(req.file.path);
          res.status(500).json({ error: "FFmpeg error: " + err.message });
        })
        .save(outputPath);
    } catch (error: any) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: error.message });
    }
  });

  // Document Watermarking (Word)
  app.post("/api/process/doc", upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) throw new Error("No file uploaded");
      const { text } = req.body;

      const doc = new Document({
        sections: [{
          headers: {
            default: new Header({
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: text || "WatermarkX", bold: true, color: "888888", size: 48 })],
              })],
            }),
          },
          footers: {
            default: new Footer({
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: text || "WatermarkX", bold: true, color: "888888", size: 24 })],
              })],
            }),
          },
          children: [
            new Paragraph({
              children: [new TextRun("Document watermarked by WatermarkX. Use PDF export for full page overlays.")],
            }),
          ],
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      fs.unlinkSync(req.file.path);
      res.set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.send(buffer);
    } catch (error: any) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: error.message });
    }
  });

  // Global Error Handler for Multer or other issues
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error: " + err.message });
  });

  // --- Vite Setup ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
