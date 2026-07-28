# 🏋️‍♂️ MoveUp — AI-Powered Move-to-Earn & Inter-City Fitness Platform

![MoveUp Banner](public/vite.svg)

> **"Move For Your City!"**  
> **MoveUp** is an innovative SportsTech web application that transforms fitness into a fun, competitive, and rewarding experience by leveraging Computer Vision AI, Move-to-Earn game mechanics, and Web3 crypto integration.

---

## 🌟 Core Concept & Vision

MoveUp motivates users to stay active by tracking their daily physical workouts in real-time through their webcam using Artificial Intelligence. The system monitors user posture, counts repetitions accurately, and awards points that can be converted into **$MOVE Tokens** on Web3 wallets or redeemed for real-world fitness rewards.

Furthermore, users compete not only individually but also as a team representing their home city (e.g., *Istanbul, Baku, Ankara*). Every completed exercise contributes to the **Global City Leaderboard**, bringing city-wide rivalry to the forefront of fitness.

---

## 🔥 Key Features

### 🤖 1. Real-Time Posture & Repetition Tracking (MediaPipe Pose AI)
- **MediaPipe Pose Engine**: Tracks 33 key body landmarks in real-time via webcam.
- **Joint Angle Calculation**: Instantaneous analysis of elbow flex angles, back straightness, and posture geometry.
- **Posture & Form Corrections**: Provides visual (*"BACK: OK"* / *"BACK: FIX!"*) and audio alerts when improper form is detected.
- **Anti-Cheat Automated Rep Counter**: Validates full extension and flexion before incrementing repetition counts for pushups, squats, and core exercises.

### 🚶 2. Mobile Step Tracking (DeviceMotion Pedometer)
- Utilizes device accelerometer sensors (`DeviceMotionEvent`) for real-time step counting during cardio missions directly inside the browser.

### 🤖 3. AI Fitness Coach & Dynamic Challenge Generator (Ollama + DeepSeek-R1)
- Integrated Python pipeline (`trainAI/ai_generate.py`) running **DeepSeek-R1** locally via **Ollama** to generate equipment-free daily fitness challenges, targets, and personalized coaching advice.

### 🏙️ 4. Inter-City Leaderboard & Gamification
- **Global City Leaderboard**: Ranks cities based on aggregate points scored by all resident members.
- **Local Member Rankings**: Displays top individual performers within each city.
- **Automatic Geolocation**: Detects user city during registration using the Browser Geolocation API and reverse geocoding.

### 🪙 5. Move-to-Earn & Web3 Crypto Ecosystem ($MOVE Token)
- **Crypto Conversion Modal**: Swap accumulated workout points into **$MOVE Tokens** at a rate of **100 Points = 1 $MOVE Token** with real-time Supabase state updates.
- **Rewards Marketplace**: Redeem points for premium fitness gear including Nike shoes, gym memberships, smartwatches, and protein shakers.

### 🔒 6. Tamper-Proof Time Synchronization
- Integrated `timeUtils` module that synchronizes daily mission resets with secure Turkey Time (UTC+3) to prevent clients from spoofing device clocks to reset daily limits.

---

## 🛠️ Tech Stack

### **Frontend & Interface**
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **UI Components & Icons**: Lucide React, Ant Design Mobile Icons
- **Webcam Integration**: React Webcam + HTML5 Canvas API Overlay

### **Artificial Intelligence & Computer Vision**
- **Web Pose Detection**: `@mediapipe/pose`, `@mediapipe/camera_utils`, `@mediapipe/drawing_utils`
- **Python CV Engine (Prototype)**: OpenCV, CVZone PoseModule, Pygame (Audio feedback)
- **Local LLM Generator**: Ollama (`deepseek-r1:1.5b`)

### **Backend & Database**
- **BaaS Platform**: [Supabase](https://supabase.com/)
- **Database**: PostgreSQL (`profiles`, `cities`, `missions`, `user_missions`)
- **Authentication**: Supabase Auth (Email/Password with Custom Metadata)
- **Stored Procedures (RPC)**: `increment_balance`, `increment_city_points`

---

## 🏗️ Project Structure

```
metu-sport-tech/
├── public/                  # Static assets (audio alerts sound.mp3, logos)
├── src/
│   ├── assets/              # Graphic assets and vectors
│   ├── components/          # Reusable UI components
│   │   └── layout/
│   │       └── BottomNav.jsx # Mobile navigation bar
│   ├── features/            # Modular feature pages
│   │   ├── auth/            # Login & SignUp with Geolocation
│   │   ├── dashboard/       # Main Feed & Daily Quests
│   │   ├── move/            # Real-time MediaPipe AI Camera view (MoveCam)
│   │   ├── profile/         # User profile stats & settings
│   │   ├── ranks/           # Inter-City & Member Leaderboards
│   │   └── rewards/         # Marketplace & $MOVE Token converter
│   ├── lib/
│   │   └── supabaseClient.js # Supabase client initialization
│   ├── utils/
│   │   └── timeUtils.js     # Secure timezone synchronization
│   ├── App.jsx              # Application router configuration
│   ├── main.jsx             # React entry point
│   └── index.css            # Global design system & styles
├── trainAI/                 # Python AI modules & standalone prototypes
│   ├── ai_generate.py       # Ollama DeepSeek-R1 daily task generator
│   ├── counter.py           # Desktop OpenCV & CVZone posture counter
│   └── daily_task_cache.json # Cached daily challenge payload
├── .env                     # Environment variables (Supabase URL & Anon Key)
├── package.json             # NPM dependencies & scripts
├── vite.config.js           # Vite configuration
└── vercel.json              # Vercel deployment configuration
```

---

## ⚡ Installation & Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/devbabayev/metu-sport-tech.git
cd metu-sport-tech
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Start the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🐍 Running Python AI Scripts (Optional)

To test the standalone OpenCV pose counter or local LLM challenge generator:

### Install Python Dependencies:
```bash
pip install opencv-python cvzone pygame ollama
```

### Pull the DeepSeek-R1 Model (for `ai_generate.py`):
```bash
ollama run deepseek-r1:1.5b
```

### Execute Scripts:
```bash
# Run desktop OpenCV posture counter:
python trainAI/counter.py

# Run AI challenge generator:
python trainAI/ai_generate.py
```

---

## 🗄️ Database Architecture (Supabase Schema)

The backend relies on PostgreSQL hosted on Supabase:

1. **`cities`**: City rankings and cumulative points (`id`, `name`, `total_points`).
2. **`profiles`**: User details (`id`, `full_name`, `city_id`, `balance`, `level`, `avatar_url`).
3. **`missions`**: Active daily fitness tasks (`id`, `title`, `target_value`, `category`, `points`).
4. **`user_missions`**: User quest completion state (`user_id`, `mission_id`, `current_value`, `is_completed`, `updated_at`).

### Custom RPC Functions:
- `increment_balance(user_id, amount)`: Safely updates user point balance.
- `increment_city_points(city_id, amount)`: Atomically updates city totals on mission completion.

---

## 📱 Application Routes

| Route | Page | Description |
| :--- | :--- | :--- |
| `/signup` | **SignUp** | User registration with auto city detection |
| `/login` | **Login** | User authentication |
| `/dashboard` | **Feed** | Daily missions, step tracker, & AI coach tips |
| `/move` | **MoveCam** | MediaPipe AI live webcam workout tracker |
| `/ranks` | **Ranks** | Global City & City Member leaderboards |
| `/rewards` | **Rewards** | Rewards shop & $MOVE Token crypto conversion |
| `/profile` | **Profile** | User profile overview & account sign out |

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  Developed with ❤️ for <b>METU Sports Tech & MoveUp Community</b>
</p>
