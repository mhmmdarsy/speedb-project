import { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

interface RegisterProps {
  onRegister: (email: string, password: string, name: string) => Promise<void>;
  onBackToLogin: () => void;
}

export function Register({ onRegister, onBackToLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    
    if (password.length < 6) {
      setError('Password harus minimal 6 karakter.');
      return;
    }
    
    setLoading(true);
    
    try {
      await onRegister(email, password, name);
      setSuccess(true);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Auto redirect to login after 2 seconds
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary to-primary-dark">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2>Buat Akun Admin</h2>
          <p className="text-gray-600">Daftarkan admin baru untuk sistem</p>
        </div>
        
        {success ? (
          <div className="p-6 bg-success/10 border-2 border-success rounded-xl text-center">
            <p className="text-success mb-2">✓ Akun admin berhasil dibuat!</p>
            <p className="text-gray-600">Mengalihkan ke halaman login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-[52px] w-5 h-5 text-gray-400" />
              <Input
                label="Nama Lengkap"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="pl-12"
              />
            </div>
            
            <div className="relative">
              <Mail className="absolute left-4 top-[52px] w-5 h-5 text-gray-400" />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@speedboat.com"
                required
                className="pl-12"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-[52px] w-5 h-5 text-gray-400" />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="pl-12"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-[52px] w-5 h-5 text-gray-400" />
              <Input
                label="Konfirmasi Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
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
              {loading ? 'Mendaftar...' : 'Daftar Admin'}
            </Button>
            
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full p-4 text-center text-primary hover:text-primary-dark transition-colors"
            >
              ← Kembali ke Login
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
