import { useMemo, useState } from 'react';
import { Paperclip, Users } from 'lucide-react';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import { parseIdList } from '../../../shared/lib/format';
import type { ReviewDetail } from '../types';

type Props = {
  mode: 'create' | 'edit';
  initialReview?: ReviewDetail;
  onSubmit: (payload: {
    content: string;
    referenceUserIds: number[];
    files: File[];
  }) => Promise<void>;
  submitting: boolean;
};

export default function ReviewForm({ mode, initialReview, onSubmit, submitting }: Props) {
  const [content, setContent] = useState(initialReview?.content ?? '');
  const [references, setReferences] = useState(
    initialReview?.references.map((reference) => String(reference.userId)).join(', ') ?? '',
  );
  const [files, setFiles] = useState<File[]>([]);

  const parsedReferences = useMemo(() => parseIdList(references), [references]);

  return (
    <div className="space-y-6">
      <Card
        title={mode === 'create' ? '검토 상신 / 재상신' : '검토 수정'}
        description={
          mode === 'create'
            ? '업무 진행 중인 상태에서 새 검토를 상신합니다.'
            : '제출된 검토 본문을 수정합니다.'
        }
      >
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">검토 본문</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={10}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              placeholder="검토 요청 본문 또는 수정 내용을 입력하세요."
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Users size={15} />
              참조자 ID 목록
            </span>
            <input
              value={references}
              onChange={(event) => setReferences(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              placeholder="예: 201, 202"
            />
            <p className="mt-2 text-xs text-gray-500">
              현재 백엔드에 사용자 검색 API가 없으므로 숫자 ID 입력 방식으로 연결합니다.
            </p>
          </label>

          {mode === 'create' && (
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Paperclip size={15} />
                초기 첨부 초안
              </span>
              <input
                type="file"
                multiple
                onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
                className="block w-full rounded-2xl border border-dashed border-gray-300 px-4 py-5 text-sm text-gray-600"
              />
              {files.length > 0 && (
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  {files.map((file) => (
                    <li key={`${file.name}-${file.size}`}>{file.name}</li>
                  ))}
                </ul>
              )}
            </label>
          )}

          <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            참조자 수: <strong>{parsedReferences.length}</strong>
            {initialReview && (
              <>
                <span className="mx-2 text-gray-300">|</span>
                현재 잠금 버전: <strong>v{initialReview.lockVersion}</strong>
              </>
            )}
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() =>
            onSubmit({
              content,
              referenceUserIds: parsedReferences,
              files,
            })
          }
          disabled={!content.trim() || submitting}
        >
          {mode === 'create' ? '상신하기' : '수정 저장'}
        </Button>
      </div>
    </div>
  );
}
