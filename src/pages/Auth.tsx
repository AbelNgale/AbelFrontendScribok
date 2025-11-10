import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { register } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Chrome } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import logo from "@/assets/logo.png";
import logoDark from "@/assets/logo-dark.png";
import authBackground from "@/assets/auth-background.png";
import api from "@/services/api";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const auth = useAuth();
  const hasRedirected = useRef(false);

  // Redireciona apenas UMA vez se já autenticado
  useEffect(() => {
    if (hasRedirected.current) return;
    
    if (!auth.loading && auth.user) {
      hasRedirected.current = true;
      navigate("/dashboard", { replace: true });
    }
  }, [auth.user, auth.loading, navigate]);

  const handleEmailAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      if (isLogin) {
        await auth.login(email, password);
        toast({ title: "Bem-vindo!", description: "Entrou com sucesso." });
        navigate("/dashboard", { replace: true });
      } else {
        const username = fullName || email.split("@")[0];
        await register(email, username, password);
        toast({ title: "Conta criada!", description: "Registo efetuado com sucesso." });
        await auth.login(email, password);
        navigate("/dashboard", { replace: true });
      }
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: unknown } };
      const description = err.response?.data || err.message || "Erro desconhecido";
      toast({ title: "Erro", description: String(description), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [loading, isLogin, email, password, fullName, auth, toast, navigate]);

  // Google Login usando @react-oauth/google
  const googleLogin = useGoogleLogin({
    onSuccess: useCallback(async (tokenResponse: any) => {
      if (loading) return;
      
      setLoading(true);
      try {
        const response = await api.post("/google/", {
          token: tokenResponse.access_token,
        });

        const { access, refresh, user } = response.data;

        if (access) {
          localStorage.setItem("accessToken", access);
          api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        }
        if (refresh) {
          localStorage.setItem("refreshToken", refresh);
        }

        auth.setUser(user);

        toast({
          title: "Bem-vindo!",
          description: "Login com Google efetuado com sucesso.",
        });

        navigate("/dashboard", { replace: true });
      } catch (error: unknown) {
        const err = error as { message?: string; response?: { data?: unknown } };
        const description = err.response?.data || err.message || "Erro no login com Google";
        toast({
          title: "Erro",
          description: String(description),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }, [loading, auth, toast, navigate]),
    onError: useCallback(() => {
      toast({
        title: "Erro",
        description: "Erro ao autenticar com Google",
        variant: "destructive",
      });
    }, [toast]),
  });

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${authBackground})` }}
    >
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-glow p-8 space-y-6">
          <div className="text-center space-y-3">
            <img src={theme === "dark" ? logoDark : logo} alt="ScriBook" className="w-16 h-16 mx-auto" />
            <p className="text-muted-foreground">
              {isLogin ? "Bem-vindo de volta! Entre para continuar" : "Crie sua conta para começar"}
            </p>
          </div>

          <Button
            onClick={() => !loading && googleLogin()}
            variant="outline"
            className="w-full"
            type="button"
            disabled={loading}
          >
            <Chrome className="mr-2 h-4 w-4" />
            {loading ? "Aguarde..." : "Continuar com Google"}
          </Button>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              OU
            </span>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="João Silva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar Conta"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => !loading && setIsLogin(!isLogin)}
              className="text-primary hover:underline disabled:opacity-50"
              disabled={loading}
            >
              {isLogin ? "Não tem uma conta? Criar conta" : "Já tem uma conta? Entrar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;