import { User } from 'lucide-react';
import LoginButton from '../Auth/LoginButton';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useAuthz';

export default function AppHeader() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/skincare-logo.dim_512x512.png"
            alt="Skin Care Products Logo"
            className="h-10 w-10 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Skin Care Products</h1>
            <p className="text-xs text-muted-foreground">Your beauty routine, simplified</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && userProfile && (
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Welcome, {userProfile.name}</span>
            </div>
          )}
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
