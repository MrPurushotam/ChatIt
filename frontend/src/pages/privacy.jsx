import { useState } from 'react'

const PrivacyPolicy = () => {
    const [activeSection, setActiveSection] = useState(null);

    const toggleSection = (sectionId) => {
        setActiveSection(activeSection === sectionId ? null : sectionId);
    };

    return (
        <div className="w-full mt-5 min-h-screen bg-gray-50 flex flex-col items-center pb-12">
            <div className="w-full max-w-4xl px-4">
                <header className="py-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Privacy Policy</h1>
                    <p className="text-gray-600">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <div className="w-20 h-1 bg-blue-500 mx-auto mt-6"></div>
                </header>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <p className="text-gray-700 mb-4">
                        At ChatIt, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
                        disclose, and safeguard your information when you use our chat application.
                        Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
                        please do not access the application.
                    </p>
                </div>

                {policyData.map((section) => (
                    <div key={section.id} className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
                        <button 
                            className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                            onClick={() => toggleSection(section.id)}
                        >
                            <h2 className="text-xl font-semibold text-gray-800">{section.title}</h2>
                            <svg 
                                className={`w-5 h-5 transition-transform duration-300 ${activeSection === section.id ? 'transform rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24" 
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        <div 
                            className={`px-6 pb-4 transition-all duration-300 ${activeSection === section.id ? 'block' : 'hidden'}`}
                        >
                            {section.content.map((paragraph, idx) => (
                                <p key={idx} className="text-gray-700 mb-4">{paragraph}</p>
                            ))}
                            {section.listItems && (
                                <ul className="list-disc pl-5 mb-4 text-gray-700">
                                    {section.listItems.map((item, idx) => (
                                        <li key={idx} className="mb-2">{item}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                ))}

                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Us</h2>
                    <p className="text-gray-700">
                        If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at 
                        <a href="mailto:work.purushotam@gmail.com" className="text-blue-600 hover:underline ml-1">work.purushotam@gmail.com</a>
                    </p>
                </div>
            </div>
        </div>
    )
}

const policyData = [
    {
        id: 1,
        title: "Information We Collect",
        content: [
            "We may collect several types of information from and about users of our application, including:",
        ],
        listItems: [
            "Personal identifiable information such as name, email address, and profile picture that you provide when registering with our application.",
            "Information about your conversations, including metadata about when messages were sent, delivered, and read.",
            "Usage data about how you interact with our application, such as features you use and time spent on the application.",
            "Device information including your device type, operating system, and browser type.",
            "Location information, with your permission, to enable location-based features."
        ]
    },
    {
        id: 2,
        title: "How We Use Your Information",
        content: [
            "We use information that we collect about you or that you provide to us, including any personal information:",
        ],
        listItems: [
            "To provide, maintain, and improve our application.",
            "To process and complete transactions, and send related information including confirmations.",
            "To send administrative information such as notifications about changes to our terms, conditions, and policies.",
            "To personalize your experience and deliver content and features that may be of interest to you.",
            "To respond to your comments, questions, and requests and provide customer service.",
            "To monitor and analyze usage and trends to improve the application and user experience."
        ]
    },
    {
        id: 3,
        title: "Disclosure of Your Information",
        content: [
            "We may disclose personal information that we collect or you provide in the following circumstances:",
        ],
        listItems: [
            "To our subsidiaries and affiliates.",
            "To contractors, service providers, and other third parties we use to support our business.",
            "To comply with any court order, law, or legal process, including responding to any government or regulatory request.",
            "To enforce our rights arising from any contracts between you and us, including the Terms of Service.",
            "If we believe disclosure is necessary to protect the rights, property, or safety of our company, our users, or others."
        ]
    },
    {
        id: 4,
        title: "Security of Your Information",
        content: [
            "We have implemented appropriate security measures to protect the information we collect. However, the transmission of information via the internet is not completely secure. Although we do our best to protect your personal information, we cannot guarantee the security of your personal information transmitted through our application. Any transmission of personal information is at your own risk.",
            "We use encryption protocols to secure message content and implement regular security audits to ensure compliance with industry standards."
        ]
    },
    {
        id: 5,
        title: "Your Choices About Your Information",
        content: [
            "You can review and change your personal information by logging into the application and visiting your account settings page.",
            "You can choose whether to allow the application to collect and use certain types of information, such as your precise location. If you block the collection of this information, some features of the application may be disabled."
        ]
    },
    {
        id: 6,
        title: "Data Retention",
        content: [
            "We will retain your personal information only for as long as reasonably necessary to fulfill the purposes for which it was collected, including to satisfy any legal, regulatory, accounting, or reporting requirements.",
            "We may retain anonymized or aggregated data indefinitely, which cannot be used to personally identify you."
        ]
    },
    {
        id: 7,
        title: "Children's Privacy",
        content: [
            "Our application is not intended for children under 13 years of age, and we do not knowingly collect personal information from children under 13. If we learn we have collected or received personal information from a child under 13 without verification of parental consent, we will delete that information."
        ]
    },
    {
        id: 8,
        title: "Changes to Our Privacy Policy",
        content: [
            "We may update our privacy policy from time to time. If we make material changes to how we treat our users' personal information, we will notify you through a notice on the application or by email.",
            "The date the privacy policy was last revised is identified at the top of the page. You are responsible for periodically visiting our application and this privacy policy to check for any changes."
        ]
    }
];

export default PrivacyPolicy
