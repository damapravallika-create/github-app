# 🌿 Smart Food Expiry Tracker

A full-featured Angular 17 PWA app to track food expiry, scan barcodes, get AI recipe suggestions, and reduce food waste.

## Features
- 📷 Live Barcode Scanner (BarcodeDetector API)
- 🔢 Manual barcode lookup (Open Food Facts API)
- 📄 OCR receipt scanner
- 🎤 Voice scan
- 🍳 AI Recipe suggestions
- 📊 Insights & Analytics
- 🛒 Grocery Planner + Meal Planner
- 📦 Inventory by location (Fridge/Pantry/Freezer)
- 📈 Batch & Lot tracking
- 👨‍👩‍👧 Family Sharing
- 🧠 Nutrition Analyzer
- 🌙 Dark/Light Mode
- 🌍 Multi-language (EN/Hindi/Telugu/Tamil)
- 📱 PWA — installable on Android & iPhone
- 🔐 Login/Signup with auth guard

## Tech Stack
- Angular 17 (Standalone components, Signals)
- SCSS with CSS variables
- Open Food Facts API
- localStorage for persistence
- Service Worker for offline support

## Run locally
```bash
npm install
ng serve
```
Open http://localhost:4200

## Deploy to Vercel
```bash
ng build
vercel dist/smart-food-expiry-tracker/browser --prod
```

## Live Demo
https://smart-food-expiry-tracker-one.vercel.app
