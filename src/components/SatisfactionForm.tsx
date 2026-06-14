import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { surveyApi, SCORE_LABELS, type SurveyDimension } from '@/lib/surveyApi';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SatisfactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceType: 'report' | 'letter' | 'complaint';
  serviceLabel: string;
  referenceId?: string;
  onSubmitted?: (csiScore: number) => void;
}

const cardClass = 'bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur';

export const SatisfactionForm: React.FC<SatisfactionFormProps> = ({
  open,
  onOpenChange,
  serviceType,
  serviceLabel,
  referenceId,
  onSubmitted,
}) => {
  const { user } = useAuth();
  const [dimensions, setDimensions] = useState<SurveyDimension[]>([]);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDimensions, setLoadingDimensions] = useState(true);

  useEffect(() => {
    if (!open) return;

    setLoadingDimensions(true);
    surveyApi
      .getDimensions()
      .then((data) => {
        setDimensions(data.dimensions);
        const initial: Record<number, number> = {};
        for (const d of data.dimensions) {
          initial[d.id] = 0;
        }
        setScores(initial);
      })
      .catch(() => {
        toast.error('Gagal memuat form penilaian');
        onOpenChange(false);
      })
      .finally(() => setLoadingDimensions(false));
  }, [open, onOpenChange]);

  const handleScoreChange = (dimensionId: number, score: number) => {
    setScores((prev) => ({ ...prev, [dimensionId]: score }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    const incomplete = dimensions.some((d) => !scores[d.id] || scores[d.id] < 1);
    if (incomplete) {
      toast.error('Lengkapi semua penilaian', {
        description: 'Pilih tingkat kepuasan untuk setiap aspek',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await surveyApi.submitSurvey({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        serviceType,
        serviceLabel,
        referenceId,
        comment: comment.trim() || undefined,
        responses: dimensions.map((d) => ({
          dimensionId: d.id,
          score: scores[d.id],
        })),
      });

      toast.success('Terima kasih atas penilaian Anda!', {
        description: `Indeks kepuasan Anda: ${result.csiScore}%`,
      });
      onSubmitted?.(result.csiScore);
      setComment('');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengirim penilaian');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${cardClass} w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-blue-950/50 [&::-webkit-scrollbar-thumb]:bg-blue-500/60 [&::-webkit-scrollbar-thumb]:rounded-full`}
      >
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            Form Penilaian Kepuasan (CSI)
          </DialogTitle>
          <DialogDescription className="text-blue-200">
            Berikan penilaian untuk layanan <strong className="text-blue-100">{serviceLabel}</strong>
            {referenceId ? ` — Ref: ${referenceId}` : ''}
          </DialogDescription>
        </DialogHeader>

        {loadingDimensions ? (
          <div className="flex items-center justify-center py-12 text-blue-200">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Memuat form...
          </div>
        ) : (
          <div className="space-y-5 mt-2">
            <p className="text-sm text-blue-300 bg-blue-950/50 border border-blue-500/30 rounded-lg p-3">
              Skala: 1 = Tidak Puas, 2 = Kurang Puas, 3 = Puas, 4 = Sangat Puas.
              CSI dihitung dengan metode indeks kepuasan tertimbang.
            </p>

            {dimensions.map((dimension) => (
              <div key={dimension.id} className="space-y-2 border border-blue-500/30 rounded-lg p-4 bg-blue-950/30">
                <Label className="text-blue-100 font-medium">{dimension.name}</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => handleScoreChange(dimension.id, score)}
                      className={`px-3 py-2 rounded-lg text-xs sm:text-sm border transition-all ${
                        scores[dimension.id] === score
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 shadow-md'
                          : 'border-blue-500/40 text-blue-200 hover:bg-blue-800/50 hover:border-blue-400'
                      }`}
                    >
                      <span className="font-bold block">{score}</span>
                      <span className="opacity-90">{SCORE_LABELS[score]}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <Label className="text-blue-200">Saran / Komentar (opsional)</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Bagikan saran untuk perbaikan layanan..."
                rows={3}
                className="bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full sm:flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  'Kirim Penilaian'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto border-blue-500/50 text-blue-300 hover:bg-blue-800/50"
              >
                Lewati
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
