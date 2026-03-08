"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, Camera, Upload, Loader2, Sparkles, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Profile {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    website: string | null;
    updated_at: string | null;
}

export function ProfileManager() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error, status } = await supabase
                    .from('profiles')
                    .select(`id, username, full_name, avatar_url, website, updated_at`)
                    .eq('id', user.id)
                    .single();

                if (error && status !== 406) {
                    console.log(error);
                }

                if (data) {
                    setProfile(data);
                    setFullName(data.full_name || "");
                    setUsername(data.username || "");
                }
            }
        } catch (error) {
            alert("Error loading user data!");
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('No user');

            const updates = {
                id: user.id,
                username,
                full_name: fullName,
                updated_at: new Date().toISOString(),
            }

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;
            setProfile({ ...profile!, ...updates });
            setShowModal(false);
            alert("Profile updated!");
        } catch (error) {
            alert("Error updating the data!");
        } finally {
            setLoading(false);
        }
    };

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            // Update profile with new avatar
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const updates = {
                    id: user.id,
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString(),
                }
                const { error } = await supabase.from('profiles').upsert(updates);
                if (error) throw error;

                setProfile({ ...profile!, ...updates as any });
            }

        } catch (error: any) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    }


    if (loading && !profile) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-white/10" />
                <div className="w-20 h-4 bg-white/10 rounded" />
            </div>
        )
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
            >
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-black/20 flex items-center justify-center">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 w-full h-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white/50" />
                        </div>
                    )}
                </div>
                <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                        {profile?.full_name || "Nexus Voyager"}
                    </p>
                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
                        Identity Profile
                    </p>
                </div>
            </button>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                className="w-full max-w-md glass-panel p-8 rounded-2xl pointer-events-auto border border-white/10 shadow-2xl relative overflow-hidden"
                            >
                                {/* Header */}
                                <div className="mb-8 text-center">
                                    <div className="relative w-24 h-24 mx-auto mb-4 group">
                                        <div className="absolute inset-0 rounded-full border border-white/10 overflow-hidden bg-black/40 flex items-center justify-center">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserCircle size={48} className="text-white/20" />
                                            )}
                                        </div>
                                        <label className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white/20 z-10">
                                            {uploading ? (
                                                <Loader2 className="animate-spin text-white" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-1 text-white/80">
                                                    <Camera size={20} />
                                                    <span className="text-[10px] uppercase font-bold tracking-widest">Upload</span>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={uploadAvatar}
                                                disabled={uploading}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    <h2 className="text-2xl font-display font-medium text-white mb-1">Identity Settings</h2>
                                    <p className="text-sm text-neutral-400">Manage your neural presence.</p>
                                </div>

                                {/* Form */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs text-neutral-500 uppercase font-mono block mb-2">Display Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-700 focus:border-cyan-500/50 focus:outline-none transition-colors"
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-neutral-500 uppercase font-mono block mb-2">Handle / Username</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-neutral-500">@</span>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-8 pr-3 text-white placeholder:text-neutral-700 focus:border-cyan-500/50 focus:outline-none transition-colors"
                                                placeholder="username"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 py-3 bg-white/5 border border-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={updateProfile}
                                            disabled={loading}
                                            className="flex-1 py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={16} /> : "Save Changes"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
