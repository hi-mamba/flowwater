<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Prerequisites
Ensure that Node.js is installed on your Windows computer (do not install `Node 18`).

`JDK 21 ` needs to be installed.


# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/07b7f366-5179-4802-b0e3-da59357bf0b3

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


# Steps to Build APK

Converting a web project based on React + Vite into an Android APK, the most popular and simplest method in the industry is to use Capacitor.

## Option 1: Local Packaging with Capacitor (Most Recommended, Best Experience)
This option requires installing the environment on your computer, but the packaged app has the best performance and can call native mobile APIs (such as native vibration, native notifications, etc.) in the future.

### Prerequisites:
Ensure that your Windows computer has Node.js installed (do not install Node 18), JDK 21 needs to be installed, and download and install Android Studio (default installation is fine, it will install Android SDK for you).

### Detailed Steps:

#### Step 1: Export and Prepare the Project
In the current AI Studio interface, click the settings menu in the upper right corner (usually three dots or a gear), select Export to ZIP.
Unzip the downloaded ZIP file into a local folder.
In that folder, open the command line (CMD or PowerShell), and run the following command to install dependencies:

> npm install

#### Step 2: Compile the Web Code
Run the build command in the command line, which will generate a dist folder in the directory:

> npm run build

#### Step 3: Install Capacitor
In the same command line window, run the following commands in sequence to install the packaging tools:
```
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/android
```

#### Step 4: Initialize Capacitor
Run the initialization command (it will ask for the app name and package name):

> npx cap init Yuequan Xiuxian com.flowwater.app

Note: After initialization, a capacitor.config.ts file will be generated in the project root directory. Open it and ensure the webDir value is "dist" (because Vite defaults to packaging into the dist directory).

#### Step 5: Add Android Platform and Sync Code
Run the following commands in sequence to inject your web code into the Android project:
```
npx cap add android
npx cap sync
```

#### Step 6: Generate APK
Run the following command, which will automatically launch Android Studio on your computer and open this Android project:

> npx cap open android

Wait for the progress bar at the bottom of Android Studio to finish loading (the first time may take a few minutes to download Gradle dependencies).
In the top menu bar of Android Studio,
Click Build -> Build Bundle(s) / APK(s) -> Build APK(s).
After compilation, a prompt will appear in the lower right corner, click locate to find the packaged app-debug.apk in the folder.
Send it to your phone and install it!

## Encountering Gradle Installation Issues, Various Conflicts

Add to the [build.gradle](android/build.gradle) file in the root directory:
```aiexclude
subprojects {
    configurations.all {
        exclude group: "org.jetbrains.kotlin", module: "kotlin-stdlib-jdk7"
        exclude group: "org.jetbrains.kotlin", module: "kotlin-stdlib-jdk8"
    }
}
```

```aiexclude
 gradlew build

```


```aiexclude
 gradlew assembleRelease
```

