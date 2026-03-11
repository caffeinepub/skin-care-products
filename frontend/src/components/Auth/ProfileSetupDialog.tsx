import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSaveCallerUserProfile } from '../../hooks/useAuthz';
import { toast } from 'sonner';
import type { SkinType } from '../../backend';

export default function ProfileSetupDialog() {
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [skinType, setSkinType] = useState<SkinType | undefined>(undefined);
  const [skinConcerns, setSkinConcerns] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        skinType: skinType,
        skinConcerns: skinConcerns
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
      });
      toast.success('Profile created successfully!');
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile');
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome! Set Up Your Profile</DialogTitle>
          <DialogDescription>
            Tell us a bit about yourself to get started with personalized recommendations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Your Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="skinType">Skin Type (optional)</Label>
            <Select
              value={skinType || 'none'}
              onValueChange={(value) => setSkinType(value === 'none' ? undefined : (value as SkinType))}
            >
              <SelectTrigger id="skinType">
                <SelectValue placeholder="Select your skin type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Prefer not to say</SelectItem>
                <SelectItem value="oily">Oily</SelectItem>
                <SelectItem value="dry">Dry</SelectItem>
                <SelectItem value="combination">Combination</SelectItem>
                <SelectItem value="sensitive">Sensitive</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="concerns">Skin Concerns (optional, comma-separated)</Label>
            <Input
              id="concerns"
              value={skinConcerns}
              onChange={(e) => setSkinConcerns(e.target.value)}
              placeholder="e.g., Acne, Dryness, Aging"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saveProfile.isPending} className="w-full">
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
