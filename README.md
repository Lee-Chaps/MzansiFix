## 🚀 Key Features

### 🤖 AI-Powered Analysis  
At its core, the app uses the **Google Gemini API** to analyze a user's photo and description.  
It automatically:  
- 🏷️ Classifies the issue (e.g., *Pothole*, *Water Leak*)  
- ⚠️ Assesses severity  
- 🎯 Determines priority level  

---

### 🏛️ Smart Department Routing  
The AI intelligently identifies the correct **Johannesburg municipal department** responsible for the issue—such as:  
- 🚧 JRA (Johannesburg Roads Agency)  
- 💧 Joburg Water  
- 💡 City Power  
It then provides **direct contact details**, saving users time and effort.

---

### 📝 Automated Report Generation  
The app instantly creates a **formal, structured, professional report** from the user’s input.  
Reports can be:  
- 📋 Copied  
- 📤 Shared  
- 📱 Sent to municipal channels easily  

---

### 📡 Offline Capability  
Users can **create and save reports offline** into an **Offline Queue**.  
When the device reconnects, reports automatically become available for AI analysis.  
- 🚫 No internet? No problem.  
- 🔄 Sync when online.

---

### 📊 Personal Dashboard & History  
Registered users get a personalized dashboard featuring:  
- 🔢 Total reports  
- 🚨 Critical issues  
- 📈 A chart showing most common issue types  
- 📜 Full reporting history  

---

### 🧠 "KasiFixer" AI Chatbot  
An integrated AI assistant that provides:  
- ❓ Answers to municipal service questions  
- 🏢 Department contact info  
- 🧭 Step-by-step guidance on using the app  

---

### 🌍 Multi-Language Support  
The app supports South Africa’s diverse languages. Users can:  
- 🌐 Select their preferred language  
- 🗣️ Have the AI understand their input  
- 📝 Generate parts of the report in that language  

---

### 📤 Report Management & Sharing  
Users can:  
- 👀 View detailed reports  
- 🔄 Update status (e.g., *Submitted → Resolved*)  
- 📩 Share via Email or WhatsApp  
- 📄 Download reports as PDF  

---

### 👤 User Profiles & Settings  
With user authentication, users can:  
- 🔐 Secure their account  
- 📝 Manage personal details  
- 🕵️ Enable anonymous reporting  
- 🔔 Customize notification preferences  

## 🧱 Tech Stack Overview

| Category | Technology | Purpose |
|---------|------------|---------|
| **Frontend & UI** | ⚛️ React | Core framework for building the Single Page Application (SPA). |
| | 🟦 TypeScript | Adds static typing for cleaner, safer, and more scalable code. |
| | 🎨 Tailwind CSS | Utility-first styling for fast, responsive UI development. |
| | 🖼️ Lucide React | Modern SVG icon set used throughout the UI. |
| **AI & Machine Learning** | 🤖 Google Gemini API (`@google/genai`) | Powers issue classification, severity detection, department routing, and the AI chatbot. |
| **Backend & Storage** | 🔐 Firebase Authentication | Manages secure user sign-up, login, and sessions. |
| | 🔥 Firestore | NoSQL database storing user profiles and issue reports. |
| **Data Visualization & Reports** | 📈 Recharts | Creates charts for user dashboards and report analytics. |
| | 📄 jsPDF | Generates downloadable PDF versions of issue reports. |
| **Browser & Device APIs** | 🎤 Web Speech API | Enables voice-to-text issue descriptions. |
| | 📍 Geolocation API | Captures accurate GPS coordinates for issue location tagging. |
| | 💾 localStorage | Stores offline reports and user settings for offline mode. |
| **Maps & Geodata** | 🗺️ OpenStreetMap | Displays interactive maps without requiring API keys. |

## 📲 How to Install & Start Using MzansiFix

Follow these steps to install MzansiFix as a mobile app and get started quickly.

---

### **Step 1: Access the App 🌐**
- Open your mobile web browser (Chrome, Safari, Samsung Internet, etc.)
- Navigate to the official MzansiFix website.

---

### **Step 2: "Install" the App to Your Home Screen 📥**

#### **📱 On Android (Chrome):**
1. Tap the **three dots (⋮)** in the top-right corner.
2. Select **"Install app"** or **"Add to Home screen"**.
3. Confirm the installation.  
   The **MzansiFix icon** will now appear on your home screen.

#### **🍎 On iOS (Safari):**
1. Tap the **Share icon** (square with an upward arrow).
2. Scroll down and tap **"Add to Home Screen"**.
3. Confirm the name and tap **Add**.  
   The app icon will now appear on your home screen.

---

### **Step 3: Create Your Account 🔐**
1. Open the app from your home screen.
2. Tap **Get Started**.
3. Enter your:
   - Name  
   - Email address  
   - Password  
4. Your secure account will be created and used to track all your reports.

---

### **Step 4: Grant App Permissions 📸🎤📍**
The first time you use key features, the app will request permission for:

- **Camera** → Take photos of issues  
- **Microphone** → Voice-to-text reporting  
- **Location (GPS)** → Automatically tag issue locations  

➡️ Tap **Allow** to ensure the app functions properly.

---

🎉 **That's it! You're ready to start reporting issues in your community.**
