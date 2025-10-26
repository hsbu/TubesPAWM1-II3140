import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL
          console.log('[NextAuth Credentials] API URL:', apiUrl)
          console.log('[NextAuth Credentials] Attempting signin for:', credentials?.email)
          
          const res = await fetch(`${apiUrl}/api/auth/signin`, {
            method: 'POST',
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
            headers: { "Content-Type": "application/json" }
          })
          
          const data = await res.json()
          console.log('[NextAuth Credentials] Response status:', res.status)
          console.log('[NextAuth Credentials] Response data:', data)
          
          if (res.ok && data.success) {
            return {
              id: data.data.user.id,
              email: data.data.user.email,
              name: data.data.user.user_metadata?.name || data.data.user.email,
              accessToken: data.data.session.access_token
            }
          }
          
          console.error('[NextAuth Credentials] Login failed:', data.message || 'Unknown error')
          return null
        } catch (error) {
          console.error('[NextAuth Credentials] Error during authorization:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/',
    error: '/',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        console.log('[NextAuth JWT] Sign in detected:', { provider: account.provider, user: user.email })
        
        if (account.provider === "google") {
          try {
            console.log('[NextAuth JWT] Calling backend /api/auth/google...')
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
              method: 'POST',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                googleId: account.providerAccountId,
              })
            })
            
            const data = await res.json()
            console.log('[NextAuth JWT] Backend response:', { status: res.status, data })
            
            if (data.success) {
              token.accessToken = data.token
              token.userId = data.user.id
              console.log('[NextAuth JWT] Token saved:', { userId: token.userId, hasToken: !!token.accessToken })
            } else {
              console.error('[NextAuth JWT] Backend error:', data)
            }
          } catch (error) {
            console.error('[NextAuth JWT] Failed to authenticate with backend:', error)
          }
        } else {
          token.accessToken = (user as any).accessToken
          token.userId = user.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string
        session.accessToken = token.accessToken as string
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})
