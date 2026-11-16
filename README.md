# Smart AI Assistant 🤖💬

A modern, full-stack, production-ready AI Chatbot Web Application inspired by **ChatGPT**, built with a **React + Vite** frontend, **Tailwind CSS**, a **Python FastAPI** backend, **SQLite** database, and flexible **LLM API** integration (Google Gemini & OpenAI-compatible providers).

---

## 🌟 Key Features

### 1. Modern ChatGPT-Style Interface
- **ChatGPT-Inspired Design**: Minimalist, distraction-free conversational layout with smooth animations and polished typography.
- **Dynamic Sidebar**: Access past conversation history, create new chats with one click, or switch between conversations instantly.
- **User & AI Message Bubbles**: Distinct, rounded message containers with avatar indicators and readable timestamps.
- **Typing Indicator**: Animated three-dot bouncing indicator simulating real-time AI thought process.
- **Auto-Scroll to Latest**: Smooth auto-scrolling to the latest incoming messages with a floating "Scroll to bottom" button when navigating history.

### 2. Intelligent AI Capabilities
- **Multi-Turn Context Maintenance**: Preserves previous conversational history so the AI remembers prior turns, questions, and code snippets.
- **Code Generation & Explanation**: Generates clean, formatted code with language tags (Python, JavaScript, SQL, HTML, etc.).
- **Syntax-Highlighted Code Blocks**: ChatGPT-style code containers featuring an automatic language badge and a one-click **"Copy code"** button with visual feedback.
- **Bilingual English & Tamil (தமிழ்) Support**: Fluently understands and responds in natural Tamil as well as English.
- **Programming Concepts & Summaries**: In-depth explanations of computer science concepts, debugging help, and structured summaries of long text.

### 3. Persistent Chat History (SQLite)
- **Automatic Storage**: All conversations and messages are persisted in a local SQLite database (`smart_assistant.db`).
- **Rename Conversations**: Edit and customize conversation titles inline directly from the sidebar.
- **Delete Conversations**: Safely delete single conversations or clear message history while keeping the thread.
- **Smart Title Auto-Generation**: Automatically assigns a concise 3–5 word title to new conversations based on the opening prompt.

### 4. Advanced Usability
- **Dark Mode & Light Mode**: Seamless theme toggling with persistent preferences saved to `localStorage`.
- **Copy AI Responses**: Quick copy button on every assistant bubble to copy the full response to clipboard.
- **Regenerate Response**: Re-runs the last prompt with conversational context to generate an alternate answer.
- **Clear Conversation**: Wipes all messages in the active conversation with a single confirmation.
- **Mobile Responsive**: Slide-out drawer navigation on mobile and tablet screens with backdrop blur.
- **Interactive Setup Modal**: If an API key is missing, provides clear step-by-step guidance on how to obtain a free key and configure `backend/.env`.

---

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | Lightning-fast reactive single page application |
| **Styling** | Tailwind CSS | Modern ChatGPT-inspired dark & light theme styling |
| **Icons** | Custom SVG Icons | Feather-weight, crisp SVG iconography (Lucide style) |
| **API Client** | Axios | Reliable HTTP communication with custom interceptors |
| **Backend** | Python 3 + FastAPI | High-performance asynchronous REST API |
| **Database** | SQLite + SQLAlchemy | Lightweight, zero-config relational message persistence |
| **LLM Integration** | Google Gemini / OpenAI | Multi-provider AI support with conversation history |

---

## 📁 Project Structure

```text
smart-ai-assistant/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app instance, CORS & exception handling
│   │   ├── config.py            # Environment configuration & system prompts
│   │   ├── database.py          # SQLAlchemy engine, session maker & init_db
│   │   ├── models.py            # SQLite schema: Conversation & Message models
│   │   ├── schemas.py           # Pydantic input validation & response models
│   │   ├── services/
│   │   │   ├── ai_service.py    # LLM API integration (Gemini & OpenAI)
│   │   │   └── chat_service.py  # SQLite CRUD operations
│   │   └── routers/
│   │       ├── conversations.py # Conversation CRUD endpoints
│   │       └── chat.py          # AI messaging, regeneration & health endpoints
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment template
│   ├── .env                     # Local configuration with API keys
│   ├── test_direct.py           # Automated backend unit test suite
│   └── test_ai_flow.py          # AI flow & multi-turn context test suite
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js        # Axios instance & API wrapper
│   │   ├── context/
│   │   │   ├── ChatContext.jsx  # Conversation state & active chat manager
│   │   │   └── ThemeContext.jsx # Dark/Light theme state
│   │   ├── components/
│   │   │   ├── Icons.jsx        # SVG icons (Bot, User, Send, Copy, Trash, etc.)
│   │   │   ├── Sidebar.jsx      # History list, rename, delete, theme switch
│   │   │   ├── ChatArea.jsx     # Header, message scroll container & status
│   │   │   ├── MessageBubble.jsx# User/AI bubble, copy & regenerate buttons
│   │   │   ├── CodeBlock.jsx    # Formatted code box with copy button
│   │   │   ├── FormattedMessage.jsx # Markdown, code fences & Tamil text rendering
│   │   │   ├── ChatInput.jsx    # Auto-resizing textarea & send button
│   │   │   ├── TypingIndicator.jsx # Animated 3-dot typing loader
│   │   │   ├── WelcomeScreen.jsx# Hero banner & starter suggestion prompts
│   │   │   └── SetupModal.jsx   # Interactive modal for API key guidance
│   │   ├── App.jsx              # Main layout wrapper
│   │   ├── main.jsx             # React DOM root entry
│   │   └── index.css            # Tailwind directives & custom animations
│   ├── package.json             # Frontend package definitions
│   ├── vite.config.js           # Vite configuration
│   └── tailwind.config.js       # Tailwind theme & class-based dark mode
├── .env.example                 # Root environment template
├── run.bat                      # 1-click Windows launcher for both servers
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+** (Python 3.11, 3.12, 3.13, 3.14 supported)
- **Node.js 18+** & **npm**

---

### Step 1: Clone or Navigate to the Project

```bash
cd c:\Users\Admin\Downloads\smart-ai-assistant
```

---

### Step 2: Backend Setup (FastAPI)

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. (Optional) Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your `.env` file:
   Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
   Open `.env` and add your LLM API Key:
   ```ini
   # Option 1: Google Gemini API (Free at https://aistudio.google.com/app/apikey)
   GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
   GEMINI_MODEL="gemini-2.5-flash"

   # OR Option 2: OpenAI / Groq / OpenRouter API
   # OPENAI_API_KEY="sk-YourOpenAIApiKeyHere"
   # OPENAI_MODEL="gpt-4o-mini"
   ```

5. Start the FastAPI backend server:
   ```bash
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   - API is running at: `http://localhost:8000`
   - Interactive Swagger API Documentation: `http://localhost:8000/docs`

---

### Step 3: Frontend Setup (React + Vite)

1. Open a second terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   - Frontend is running at: `http://localhost:5173`

---

### Step 4: 1-Click Launch (Windows)

On Windows, simply double-click the included `run.bat` script in the root directory. It will automatically launch both the FastAPI backend and the React Vite frontend in separate terminal windows.

---

## 🧪 Testing the Application

Automated test suites are included to verify database persistence, conversation lifecycle, AI flow, and context preservation:

```bash
cd backend
python -u test_direct.py
python -u test_ai_flow.py
```

Expected output:
```text
✓ Health response: status=configuration_needed, provider=None
✓ Created conversation ID: e0c9ab4d23744d528eb2abfc0ba1fb59
✓ Listed 1 conversations successfully
✓ Fetched conversation details passed
✓ Updated title passed
✓ Clear conversation passed
✓ Delete conversation passed
✓ Chat prompt sent and stored in DB
✓ Conversation context verified: previous messages passed to LLM
✓ Regenerate response succeeded
✓ All tests completed successfully!
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status and root endpoint |
| `GET` | `/api/chat/health` | Check AI provider connection & key configuration status |
| `POST` | `/api/chat` | Send a prompt, maintain context, and receive AI response |
| `POST` | `/api/chat/regenerate` | Regenerate the last AI response with conversational context |
| `GET` | `/api/conversations` | List all saved conversations with message counts |
| `POST` | `/api/conversations` | Create a new conversation |
| `GET` | `/api/conversations/{id}` | Get full chronological message history of a conversation |
| `PATCH` | `/api/conversations/{id}` | Rename a conversation title |
| `DELETE` | `/api/conversations/{id}` | Delete a conversation and all its messages |
| `POST` | `/api/conversations/{id}/clear`| Clear all messages within a conversation |

Full interactive OpenAPI Swagger documentation is available at `http://localhost:8000/docs`.

---

## 🌐 Bilingual & Code Highlights

### English & Tamil (தமிழ்)
Smart AI Assistant natively understands both English and Tamil. Try prompts such as:
- *"வணக்கம்! பைத்தான் (Python) என்றால் என்ன? தமிழில் விளக்குங்கள்."*
- *"Explain recursion in programming using a Tamil analogy."*

### Formatted Code Blocks
Any code generated by the assistant is rendered in a syntax-highlighted container with a language pill and a **"Copy code"** button that copies raw code cleanly to the clipboard.

---

## 🔒 Security Best Practices
- **No Client-Side Secrets**: API keys are strictly kept on the FastAPI backend in `.env` and are never sent or exposed to the client browser.
- **Input Validation**: Pydantic models validate all incoming payloads to prevent empty prompts or malformed input.
- **Graceful Error Handling**: If no API key is provided, the UI displays a clean setup modal without crashing or returning fake placeholder text.
