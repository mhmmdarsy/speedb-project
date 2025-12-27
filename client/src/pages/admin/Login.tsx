import { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { Lock, Mail, CircleArrowLeft } from 'lucide-react';
import { goBack } from '../../lib/navigation';
import { useNavigate } from 'react-router-dom';
interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegisterClick?: () => void;
}

export function Login({ onLogin, onRegisterClick }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onLogin(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary to-primary-dark">
      <Card className="w-full max-w-md">
        <div className="mb-4 flex justify-end">
          <Button
            type="button"
            size="medium"
            className="flex items-center gap-2"
            onClick={() => {
              goBack(navigate);
            }}
          >
            <CircleArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </Button>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2>Login sebagai Admin</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              required
              className="pl-12"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              className="pl-12"
            />
          </div>

          {error && (
            <div className="p-4 bg-error/10 border-2 border-error rounded-xl">
              <p className="text-error">{error}</p>
            </div>
          )}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </Button>

          {onRegisterClick && (
            <button
              type="button"
              onClick={onRegisterClick}
              className="w-full p-4 text-center text-primary hover:text-primary-dark transition-colors"
            >
              Belum punya akun? Daftar Admin
            </button>
          )}
        </form>
      </Card>
    </div>
  );
}
