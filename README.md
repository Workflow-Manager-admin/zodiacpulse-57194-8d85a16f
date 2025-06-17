# zodiacpulse-57194-8d85a16f

**Note:**  
This project now requires running `server.js` (a Node.js/Express proxy) for all Deepseek/OpenRouter API calls.  
1. Copy `.env.example` to `.env` and add your Deepseek API key.  
2. Run the backend:  
   ```
   npm install express cors node-fetch dotenv
   node server.js
   ```
3. The React frontend should call `http://localhost:5000/chat` for all Deepseek API requests (see `/zodiacpulse/src/ZodiacPulseMain.js` for example).
