import Link from "next/link";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#06060c] text-white/80 py-20 px-6 md:px-20 selection:bg-cyan-500/30">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-cyan-400 hover:text-cyan-300 text-sm font-mono tracking-widest uppercase mb-8 inline-block">
                    &larr; Back to Home
                </Link>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Privacy Policy</h1>

                <div className="space-y-8 text-neutral-300 leading-relaxed font-light">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">1. Introduction</h2>
                        <p>
                            Welcome to NexusMind. Your privacy is paramount. This Privacy Policy explains how the NexusMind Assistant Chrome Extension and our Web Platform collect, use, and protect your information. By using our extension, you agree to the collection and use of information in accordance with this policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">2. Data We Collect & Why (Chrome Extension)</h2>
                        <p className="mb-4">Our Chrome Extension is designed with a single purpose: to allow you to seamlessly capture content from the web into your personal NexusMind Second Brain. To achieve this, we request specific permissions:</p>
                        <ul className="list-disc pl-6 space-y-3">
                            <li><strong className="text-white">Authentication Data:</strong> When you log in, we securely use tokens to associate the notes you capture strictly with your personal account.</li>
                            <li><strong className="text-white">ActiveTab & Website Content:</strong> We only access the URL and content of the <i>specific webpage you are currently viewing</i> when you explicitly act (e.g., clicking our extension icon or using the right-click context menu). This text and link are sent to our servers solely to be saved into your private database.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">3. Data Usage and Sharing</h2>
                        <p>
                            The data you capture (texts, URLs, images) is transmitted securely and stored in our database. <strong>We do not sell, rent, or monetize your personal data, web history, or captured content to third parties under any circumstances.</strong> Data is used strictly to provide you with the visual organization and AI summarization features of the NexusMind application.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">4. Data Security & Storage</h2>
                        <p>
                            Your captured content is stored securely on our cloud infrastructure (Supabase/Vercel). We implement industry-standard encryption and security measures to ensure your data is protected against unauthorized access.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">5. User Control & Deletion</h2>
                        <p>
                            You maintain full control over your data. You can delete individual captured notes or entire projects from within the NexusMind Dashboard. If you wish to delete your entire account and all associated data, please contact us.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">6. Changes to This Policy</h2>
                        <p>
                            We may update our Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date at the bottom of this page. You are advised to review this Privacy Policy periodically for any changes.
                        </p>
                    </section>

                    <div className="pt-8 border-t border-white/10 text-sm text-neutral-500">
                        Last Updated: March 11, 2026
                    </div>
                </div>
            </div>
        </div>
    );
}
