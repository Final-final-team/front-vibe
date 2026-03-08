import { useRef } from 'react';
import { Paperclip, Upload } from 'lucide-react';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import { formatBytes, formatDate } from '../../../shared/lib/format';
import type { AttachmentInfo } from '../types';

type Props = {
  attachments: AttachmentInfo[];
  canManage: boolean;
  uploading: boolean;
  onUpload: (file: File) => Promise<void>;
  onDelete: (attachmentId: number) => Promise<void>;
};

export default function ReviewAttachmentManager({
  attachments,
  canManage,
  uploading,
  onUpload,
  onDelete,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Card
      title="첨부"
      description="presign -> upload -> confirm 흐름을 한 번의 업로드 액션으로 감쌉니다."
      action={
        <Button
          variant="secondary"
          icon={<Upload size={15} />}
          disabled={!canManage || uploading}
          onClick={() => inputRef.current?.click()}
        >
          첨부 업로드
        </Button>
      }
    >
      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (!file) {
            return;
          }

          void onUpload(file);
          event.currentTarget.value = '';
        }}
      />
      <div className="space-y-3">
        {attachments.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-5 text-sm text-gray-500">
            첨부 파일이 없습니다.
          </div>
        )}
        {attachments.map((attachment) => (
          <div
            key={attachment.attachmentId}
            className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Paperclip size={15} />
                <span className="truncate">{attachment.originalName}</span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {formatBytes(attachment.sizeBytes)} · {formatDate(attachment.createdAt)}
              </div>
            </div>
            {canManage && (
              <Button variant="ghost" onClick={() => void onDelete(attachment.attachmentId)}>
                제거
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
