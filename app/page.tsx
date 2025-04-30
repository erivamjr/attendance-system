import { LoginForm } from "@/components/login-form"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sistema de Gestão de Frequência</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Acesse o sistema para gerenciar a frequência dos servidores
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
