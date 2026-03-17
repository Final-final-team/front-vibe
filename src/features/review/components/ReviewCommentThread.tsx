import { useState } from 'react';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import { formatDate } from '../../../shared/lib/format';
import type { CommentInfo, ReviewStatus } from '../types';

type Props = {
  comments: CommentInfo[];
  status: ReviewStatus;
  currentUserId: number | null;
  canCreate: boolean;
  onCreate: (content: string) => Promise<void>;
  onUpdate: (commentId: number, content: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
};

export default function ReviewCommentThread({
  comments,
  status,
  currentUserId,
  canCreate,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  return (
    <Card
      title="코멘트"
      description={
        status === 'APPROVED'
          ? '승인된 review는 코멘트 작성만 가능하고 수정/삭제는 막습니다.'
          : 'SUBMITTED 상태에서는 작성, 수정, 삭제가 가능합니다.'
      }
    >
      <div className="space-y-4">
        {comments.length === 0 && <p className="text-sm text-gray-500">작성된 코멘트가 없습니다.</p>}
        {comments.map((comment) => {
          const editable =
            status === 'SUBMITTED' && currentUserId != null && comment.authorId === currentUserId;
          const isEditing = editingId === comment.commentId;

          return (
            <div key={comment.commentId} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-800">작성자 #{comment.authorId}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                    {comment.edited && comment.editedAt ? ` · 수정됨 ${formatDate(comment.editedAt)}` : ''}
                  </div>
                </div>
                {editable && !isEditing && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      className="px-3 py-1.5"
                      onClick={() => {
                        setEditingId(comment.commentId);
                        setEditingContent(comment.content);
                      }}
                    >
                      수정
                    </Button>
                    <Button
                      variant="ghost"
                      className="px-3 py-1.5"
                      onClick={() => void onDelete(comment.commentId)}
                    >
                      삭제
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="mt-3 space-y-3">
                  <textarea
                    value={editingContent}
                    onChange={(event) => setEditingContent(event.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingId(null);
                        setEditingContent('');
                      }}
                    >
                      취소
                    </Button>
                    <Button
                      onClick={async () => {
                        await onUpdate(comment.commentId, editingContent);
                        setEditingId(null);
                        setEditingContent('');
                      }}
                      disabled={!editingContent.trim()}
                    >
                      저장
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {comment.content}
                </p>
              )}
            </div>
          );
        })}

        <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={4}
            disabled={!canCreate}
            placeholder={
              canCreate ? '코멘트를 입력하세요.' : '현재 상태에서는 코멘트를 작성할 수 없습니다.'
            }
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:bg-gray-50"
          />
          <div className="mt-3 flex justify-end">
            <Button
              disabled={!canCreate || !draft.trim()}
              onClick={async () => {
                await onCreate(draft);
                setDraft('');
              }}
            >
              코멘트 작성
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
