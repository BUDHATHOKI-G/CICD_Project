
import cors from "cors";
import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(cors({
  origin: "http://localhost:5173", // Vite frontend
  credentials: true
}));