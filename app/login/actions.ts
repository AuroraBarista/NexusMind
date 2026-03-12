'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function signup(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    // If session is missing, email confirmation might be forced.
    // We will bypass it by manually confirming them via admin role and then re-authenticating
    if (!data.session) {
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (serviceKey && data.user?.id) {
            const adminAuthClient = createAdminClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                serviceKey,
                { auth: { autoRefreshToken: false, persistSession: false } }
            ).auth.admin

            // Auto-confirm the user in the database
            await adminAuthClient.updateUserById(data.user.id, { email_confirm: true })

            // Now immediately log them in normally (since they are confirmed)
            const signInRes = await supabase.auth.signInWithPassword({ email, password })
            if (signInRes.data.session) {
                revalidatePath('/', 'layout')
                return { success: true, requiresEmailConfirmation: false }
            }
        }
    }

    // Session is either immediately granted or the admin-auto-confirm fallback wasn't hit
    if (data.session) {
        revalidatePath('/', 'layout')
        return {
            success: true,
            requiresEmailConfirmation: false
        }
    }

    // Ultimate fallback if nothing else catches the above states (e.g., config requires email but admin failed)
    return {
        success: true,
        requiresEmailConfirmation: true,
        message: 'Registration accepted. Please check your email to continue.'
    }
}
