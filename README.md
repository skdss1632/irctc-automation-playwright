# 🚆 IRCTC Tatkal Ticket Automation 🎫

[![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Anti-Detection](https://img.shields.io/badge/Anti--Detection-Stealth-red?style=for-the-badge)](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth)

> **Intelligent browser automation for IRCTC ticket booking with advanced anti-detection techniques to bypass bot detection systems.**

---

## 📋 Table of Contents
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚙️ Installation](#️-installation)
- [🚀 Usage](#-usage)
- [🔐 Anti-Detection Techniques](#-anti-detection-techniques)
- [📸 Demo](#-demo)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

✅ **Automated Login** - Securely logs into IRCTC with stored credentials  
✅ **Smart Form Filling** - Auto-fills passenger details, seat preferences, and payment info  
✅ **Anti-Bot Detection** - Uses Playwright Stealth to bypass IRCTC's advanced bot detection  
✅ **Human-like Behavior** - Random delays and natural mouse movements  
✅ **Dynamic Element Handling** - Robust selectors with auto-wait mechanisms  
✅ **CAPTCHA Support** - Manual CAPTCHA solving in headed mode  
✅ **Multi-Passenger Support** - Handles multiple passengers with dynamic form addition  

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Playwright** | Browser automation framework |
| **Puppeteer Stealth Plugin** | Anti-detection & fingerprint masking |
| **JavaScript/Node.js** | Core scripting language |

---

## ⚙️ Installation

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager
- Windows

### Setup Instructions

# Clone the repository
git clone https://github.com/skdss1632/irctc-automation-playwright.git
cd irctc-automation-playwright

Install dependencies
npm install

Add your credentials in config.js
playwright.env.json


### Configuration

## 🚦 Sample Booking Configuration (fixtures/passenger.data.json)

Below is a sample configuration file used to trigger the IRCTC automation workflow.
You can add more obj to add more passener details
```json
{
  "TRAIN_NO": "12436",
  "TRAIN_COACH": "3A",
  "TRAVEL_DATE": "29/11/2025",
  "SOURCE_STATION": "NDLS",
  "BOARDING_STATION": null,
  "DESTINATION_STATION": "BGS",
  "TATKAL": false,
  "PREMIUM_TATKAL": false,
  "UPI_ID_CONFIG": "@ybl",
  "PASSENGER_DETAILS": [
    {
      "NAME": "Sourav",
      "AGE": 40,
      "GENDER": "Male",
      "SEAT": "Lower",
      "FOOD": "No Food"
    },
    {
      "NAME": "Sourav",
      "AGE": 35,
      "GENDER": "Female",
      "SEAT": "Upper",
      "FOOD": "No Food"
    }
  ],
  "__valid_coaches__": "SL | 2A | 3A | 3E | 1A | CC | EC | 2S",
  "__valid_seats__": "Lower | Middle | Upper | Side Lower | Side Upper | Window Side | No Preference",
  "__valid_genders__": "Male | Female | Transgender",
  "__valid_food_choices__": "Veg | Non Veg | No Food"
}
```


Features in Action
1. Login Automation: Automatically enters credentials
2. Train Search: Searches for trains based on source, destination, and date
3. Passenger Input: Fills passenger details with anti-detection delays
4. Payment Flow: Navigates through UPI/payment gateway selection --currently not having wallet payment feature

---

## 🔐 Anti-Detection Techniques

### 🎭 Stealth Implementation


### 🛡️ Bypass Strategies

| Technique | Implementation |
|-----------|----------------|
| *Fingerprint Evasion* | Randomized viewport, user-agent rotation |
| *Human Behavior* | Random delays (500-2000ms) between actions |
| *Headed Mode* | Runs in visible browser to avoid headless detection |

### 🧪 Key Code Snippet



---

## 📸 Demo

### Workflow Diagram

User Input → Login → Search Train → Select Class → Fill Passengers → Payment → Success


---

## 🎯 Project Highlights for Recruiters

- ✅ *Full-Stack Automation*: End-to-end automation of complex multi-step forms
- ✅ *Anti-Detection Expertise*: Advanced stealth techniques to bypass security measures
- ✅ *Clean Architecture*: Modular functions, reusable helpers, and clear separation of concerns

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/FeatureName)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/FeatureName)
5. Open a Pull Request

---

## ⚠️ Disclaimer

This project is for *educational purposes only*. Automated ticket booking may violate IRCTC's Terms of Service. Use responsibly and at your own risk.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋‍♂️ Author

*sourav

---

## ⭐ Show Your Support

If this project helped you or you found it interesting, please give it a ⭐ on GitHub!

---

*Built with ❤️ using Playwright and JavaScript*








