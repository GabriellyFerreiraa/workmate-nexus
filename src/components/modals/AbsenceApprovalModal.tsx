import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, XCircle, Calendar, User } from 'lucide-react';

interface AbsenceApprovalModalProps {
  request: any;
  onClose: () => void;
  onApprove: (comment: string) => void;
  onReject: (comment: string) => void;
}

export const AbsenceApprovalModal = ({ request, onClose, onApprove, onReject }: AbsenceApprovalModalProps) => {
  const [comment, setComment] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = () => {
    onApprove(comment);
  };

  const handleReject = () => {
    if (!comment.trim()) {
      alert('Debes proporcionar un comentario para rechazar la solicitud');
      return;
    }
    onReject(comment);
  };

  const getDuration = () => {
    const start = new Date(request.start_date);
    const end = new Date(request.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Revisar Solicitud de Ausencia
          </DialogTitle>
          <DialogDescription>
            Revisa y decide sobre esta solicitud de ausencia
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Request Details */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{request.analyst_profile?.name}</span>
              <Badge variant="secondary">Pendiente</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Fecha de inicio</Label>
                <p className="font-medium">
                  {format(new Date(request.start_date), 'PPP', { locale: es })}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Fecha de fin</Label>
                <p className="font-medium">
                  {format(new Date(request.end_date), 'PPP', { locale: es })}
                </p>
              </div>
            </div>
            
            <div className="text-sm">
              <Label className="text-muted-foreground">Duración</Label>
              <p className="font-medium">{getDuration()} día(s)</p>
            </div>
            
            <div>
              <Label className="text-muted-foreground">Motivo</Label>
              <p className="mt-1 p-3 bg-muted rounded text-sm">{request.reason}</p>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Solicitado el {format(new Date(request.created_at), 'PPp', { locale: es })}
            </div>
          </div>
          
          {/* Comment Section */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              Comentario {action === 'reject' && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id="comment"
              placeholder={
                action === 'approve' 
                  ? "Comentario opcional sobre la aprobación..." 
                  : action === 'reject'
                  ? "Explica el motivo del rechazo..."
                  : "Agrega un comentario..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setAction('reject');
                handleReject();
              }}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Rechazar
            </Button>
            <Button
              onClick={() => {
                setAction('approve');
                handleApprove();
              }}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Aprobar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};