# 📚 Study Time Planner

> A clean, lightweight daily study planner and session timer web application built entirely with **Vanilla HTML5, CSS3, and JavaScript**.

[![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)](#tech-stack)
[![Pure Vanilla JS](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](#tech-stack)
[![Theme](https://img.shields.io/badge/Theme-Light%20%7C%20Dark-blue.svg)](#features)
[![Responsive](https://img.shields.io/badge/Responsive-Mobile%20%7C%20Desktop-orange.svg)](#features)

---

## 📖 Overview

**Study Time Planner** helps students effortlessly organize their daily study routines. Enter your total available study hours, add your subjects and their required durations, and instantly generate an orderly, sequential study schedule starting at **09:00 AM**.

It includes a **live real-time clock** to keep track of current time and an **interactive study timer** with audio chimes to stay focused during each session.

---

## ✨ Key Features

- 🕒 **Live Real-Time Clock**: Continuously displays the current clock time (`HH:MM:SS AM/PM`) at the top of the app.
- 📅 **Automated Daily Scheduling**: Generates clean sequential study slots starting at 09:00 AM with proper 12-hour AM/PM transitions.
- ⏱️ **Interactive Study Session Timer**: Click **"Start Timer"** on any scheduled subject to launch a focused countdown with pause, resume, reset, and progress tracking.
- 🔔 **Gentle Completion Chime**: Native Web Audio API sound alert when a study session finishes (zero external audio files).
- 🌓 **Dark & Light Mode**: Seamless theme toggle that respects system preferences and persists user choice in `localStorage`.
- ⏳ **Decimal Hours Support**: Accurately calculates minutes for partial hours (e.g., `1.5` hours = `1` hour `30` minutes).
- 📊 **Remaining Time Summary**: Displays total study time, subject count, and any unallocated remaining hours without inventing filler subjects.
- 🛡️ **Comprehensive Validation**: Prevents over-allocation, empty names, and zero or negative hours with friendly error alerts.
- 📱 **Fully Responsive**: Tailored for phones, tablets, and desktop displays with zero horizontal scrolling.
- ⚡ **Zero External Dependencies**: No frameworks, no build tools, no npm packages. Runs anywhere instantly.

---

## 🚀 Getting Started

No installation or build process is needed.

### Method 1: Open Directly in Browser
Simply double-click `index.html` or open it with any web browser (Chrome, Edge, Firefox, Safari).

### Method 2: Run with Built-in Server (Node.js)
```bash
node serve.js
```
Then open your browser to **http://localhost:5500**.

---

## 💡 How It Works

1. **Input Allocation**: Enter your available study hours (e.g., `5` hours) and list your subjects with durations.
2. **Validation**: JavaScript verifies that inputs are valid and that total subject hours do not exceed your available time.
3. **Sequential Scheduling**: Durations are converted into exact minutes (`hours × 60`). The schedule begins at **09:00 AM** and calculates each start and end time sequentially.
4. **Active Study Timer**: Click **Start Timer** on any session in the timeline to launch the countdown and focus on your work.

---

## 📁 Project Structure

```text
Study-Time-Planner/
├── index.html       # Semantic HTML5 markup & accessible controls
├── style.css        # CSS variables, dark/light themes, responsive layout
├── script.js        # Scheduling algorithm, validation, timer & live clock
├── serve.js         # Zero-dependency local development server
├── .gitignore       # Git ignore rules
└── README.md        # Project documentation
```

---

## 🛠️ Tech Stack

- **HTML5**: Semantic tags, accessible form controls, ARIA attributes.
- **CSS3**: Custom properties (variables), Flexbox, CSS Grid, animations.
- **Vanilla JavaScript**: ES6+, DOM manipulation, Web Audio API, timers.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
