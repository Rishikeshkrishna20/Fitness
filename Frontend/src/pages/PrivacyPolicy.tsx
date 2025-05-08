import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">
        At FitTrack, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Personal Information (Name, Email, etc.)</li>
        <li>Fitness data from connected services like Google Fit</li>
        <li>Usage data (logs, browser type, device info)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">2. How We Use Your Data</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>To provide personalized fitness tracking</li>
        <li>To improve our services and user experience</li>
        <li>To communicate updates and notifications</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">3. Data Sharing</h2>
      <p className="mb-4">
        We do not sell your data. We only share your data with third parties when required by law or to integrate fitness services.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">4. Data Security</h2>
      <p className="mb-4">
        We implement security measures to protect your data. However, no system is 100% secure.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">5. Your Rights</h2>
      <p className="mb-4">
        You can request access to, or deletion of, your data at any time by contacting us.
      </p>

      <p className="mt-8">Last updated: May 2025</p>
    </div>
  );
};

export default PrivacyPolicy;

