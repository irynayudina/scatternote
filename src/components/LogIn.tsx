import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
 
const formSchema = z.object({
  username: z.string()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
})

const LogIn = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setError("")
        
        try {
            // Placeholder API call - replace with actual backend endpoint
            const response = await fetch('http://localhost:3000/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                throw new Error('Login failed. Please check your credentials.')
            }

            // For now, use hardcoded response object
            const userData = {
                id: 1,
                username: values.username,
                email: `${values.username}@example.com`,
                password: values.password,
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTYxNjI0NzQ0MCwiZXhwIjoxNjE2MjUxMDQwfQ.example",
                role: "user",
                createdAt: new Date().toISOString()
            }

            // Save to session storage
            sessionStorage.setItem('user', JSON.stringify(userData))
            sessionStorage.setItem('token', userData.token)

            // Redirect to desk page
            navigate('/desk')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Enter your username" 
                                            {...field} 
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter your username (letters, numbers, and underscores only)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="password" 
                                            placeholder="Enter your password" 
                                            {...field} 
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Must contain uppercase, lowercase, and number
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button 
                            type="submit" 
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default LogIn    