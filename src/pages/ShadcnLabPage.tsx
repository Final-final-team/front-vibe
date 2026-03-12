import { useState, type ComponentType } from 'react';
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Filter,
  FolderKanban,
  LayoutDashboard,
  MoreHorizontal,
  Search,
  SendHorizontal,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const navItems = [
  { label: '업무', icon: FolderKanban, active: true },
  { label: '검토', icon: SendHorizontal, active: false },
  { label: '멤버', icon: Users, active: false },
  { label: '권한', icon: ShieldCheck, active: false },
  { label: '대시보드', icon: LayoutDashboard, active: false },
] as const satisfies ReadonlyArray<{
  label: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
}>;

const rows = [
  {
    title: 'QA 회귀 테스트 반영',
    owner: '이도연',
    priority: 'HIGH',
    status: '검토중',
  },
  {
    title: '역할 정책 매트릭스 정리',
    owner: '김새은',
    priority: 'MEDIUM',
    status: '진행중',
  },
  {
    title: '정산 예외 처리 가이드',
    owner: '박민재',
    priority: 'LOW',
    status: '완료',
  },
] as const;

export default function ShadcnLabPage() {
  const [view, setView] = useState('workspace');

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_24%),linear-gradient(180deg,#f6f8fb_0%,#fbfcfe_100%)]">
        <Sidebar variant="floating">
          <SidebarHeader className="px-3 py-4">
            <div className="flex items-center gap-3 rounded-xl bg-background px-3 py-3 shadow-sm ring-1 ring-border">
              <Avatar className="h-10 w-10">
                <AvatarFallback>FW</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">front-vibe lab</div>
                <div className="text-xs text-muted-foreground">neutral tone / radix nova</div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>도메인 탐색</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton isActive={item.active} tooltip={item.label}>
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <SidebarGroupLabel>참고 포인트</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-2 px-2 text-xs text-muted-foreground">
                  <div className="rounded-lg bg-sidebar-accent px-3 py-2">Sidebar와 Card 조합이 내부툴에 안정적임</div>
                  <div className="rounded-lg bg-sidebar-accent px-3 py-2">Dialog, Sheet는 액션 중심 플로우에 적합</div>
                  <div className="rounded-lg bg-sidebar-accent px-3 py-2">Table은 그대로 쓰기보다 보드 셀 스타일만 차용 권장</div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="px-3 pb-4">
            <div className="rounded-xl border border-sidebar-border bg-sidebar-accent px-3 py-3 text-xs text-sidebar-accent-foreground">
              현재 선택: <span className="font-semibold">neutral</span>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
              <div className="flex items-center gap-3 px-6 py-4">
                <SidebarTrigger />
                <div className="min-w-0">
                  <h1 className="text-xl font-semibold tracking-tight">shadcn 디자인 랩</h1>
                  <p className="text-sm text-muted-foreground">
                    현재 업무관리툴에 맞는 컴포넌트 결을 빠르게 비교하는 페이지
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant="secondary">Vite</Badge>
                  <Badge variant="secondary">Tailwind 4</Badge>
                  <Badge>neutral</Badge>
                </div>
              </div>
            </header>

            <main className="flex-1 px-6 py-6">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_380px]">
                <div className="space-y-6">
                  <Card className="overflow-hidden border-border/70 shadow-sm">
                    <CardHeader className="gap-4 border-b border-border/70 bg-background/80">
                      <div className="flex flex-wrap items-center gap-3">
                        <div>
                          <CardTitle className="text-2xl">워크스페이스 셸 후보</CardTitle>
                          <CardDescription>
                            탭, 검색, 필터, 상태 배지, 헤더 액션 조합을 보는 기준안
                          </CardDescription>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                보기 옵션
                                <ChevronRight className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>레이아웃 액션</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>테이블 우선</DropdownMenuItem>
                              <DropdownMenuItem>패널 우선</DropdownMenuItem>
                              <DropdownMenuItem>밀도 높게</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm">멤버 초대</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>멤버 초대 모달 후보</DialogTitle>
                                <DialogDescription>
                                  실제 초대 API 연결 전이라도 Dialog 중심 플로우 검증이 가능함
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-3">
                                <Input placeholder="이메일 주소" />
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="초기 역할 선택" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="owner">Project Owner</SelectItem>
                                    <SelectItem value="reviewer">Reviewer</SelectItem>
                                    <SelectItem value="operator">Operator</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <DialogFooter>
                                <Button variant="outline">취소</Button>
                                <Button>초대 전송</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>SPRK</Badge>
                        <Badge variant="secondary">Project Context</Badge>
                        <Badge variant="outline">8 members</Badge>
                        <Badge variant="outline">2 review queue</Badge>
                      </div>

                      <Tabs value={view} onValueChange={setView} className="w-full">
                        <TabsList className="h-10">
                          <TabsTrigger value="workspace">업무 뷰</TabsTrigger>
                          <TabsTrigger value="reviews">검토 뷰</TabsTrigger>
                          <TabsTrigger value="future">미래 확장</TabsTrigger>
                        </TabsList>
                        <TabsContent value={view} className="mt-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="relative min-w-[280px] flex-1">
                              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                              <Input className="pl-9" placeholder="현재 뷰에서 검색" />
                            </div>
                            <Button variant="outline" size="sm">
                              <Filter className="size-4" />
                              마일스톤
                            </Button>
                            <Button variant="outline" size="sm">
                              담당자
                            </Button>
                            <Button variant="outline" size="sm">
                              상태
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardHeader>

                    <CardContent className="pt-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        <MetricMini label="마일스톤" value="3개" meta="대분류 기반 보드 섹션" />
                        <MetricMini label="검토 대기" value="2건" meta="현재 review 큐" />
                        <MetricMini label="완료" value="1건" meta="승인 기준 완료" />
                      </div>

                      <Separator className="my-5" />

                      <div className="rounded-xl border border-border/70">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>업무</TableHead>
                              <TableHead>담당자</TableHead>
                              <TableHead>우선순위</TableHead>
                              <TableHead>상태</TableHead>
                              <TableHead className="text-right">액션</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {rows.map((row) => (
                              <TableRow key={row.title}>
                                <TableCell className="font-medium">{row.title}</TableCell>
                                <TableCell>{row.owner}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary">{row.priority}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={row.status === '완료' ? 'outline' : 'secondary'}>
                                    {row.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="icon-sm">
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="border-border/70 shadow-sm">
                      <CardHeader>
                        <CardTitle>이 톤이 맞는 이유</CardTitle>
                        <CardDescription>
                          내부 업무툴 기준으로 neutral이 가장 안정적인 이유
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>1. 보드, 표, 패널, 모달이 모두 과장되지 않고 정리돼 보입니다.</p>
                        <p>2. 이후 프로젝트 고유 색을 얹어도 회색 축이 충돌하지 않습니다.</p>
                        <p>3. 검토/권한 같은 밀도 높은 화면에서 피로감이 덜합니다.</p>
                      </CardContent>
                    </Card>

                    <Card className="border-border/70 shadow-sm">
                      <CardHeader>
                        <CardTitle>다음에 실제 도입할 후보</CardTitle>
                        <CardDescription>
                          바로 현재 앱에 녹여볼 가치가 높은 shadcn 컴포넌트
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        {['Sidebar', 'Tabs', 'Dialog', 'Sheet', 'Dropdown Menu', 'Table', 'Badge'].map((item) => (
                          <Badge key={item} variant="outline">
                            {item}
                          </Badge>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="space-y-6">
                  <Card className="border-border/70 shadow-sm">
                    <CardHeader>
                      <CardTitle>Sheet 후보</CardTitle>
                      <CardDescription>
                        업무 상세 패널이나 검토 처리 보조 패널에 적합
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button className="w-full">우측 상세 패널 열기</Button>
                        </SheetTrigger>
                        <SheetContent className="w-[420px] sm:max-w-[420px]">
                          <SheetHeader>
                            <SheetTitle>업무 상세 패널</SheetTitle>
                            <SheetDescription>
                              row 클릭 후 세부 필드와 검토 진입점을 모아 보여주는 패턴
                            </SheetDescription>
                          </SheetHeader>
                          <div className="mt-6 space-y-4">
                            <Field label="업무 제목" value="QA 회귀 테스트 반영" />
                            <Field label="담당자" value="이도연" />
                            <Field label="검토 상태" value="Round 3 / 제출됨" />
                            <Button className="w-full">review 상세로 이동</Button>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </CardContent>
                  </Card>

                  <Card className="border-border/70 shadow-sm">
                    <CardHeader>
                      <CardTitle>비교 메모</CardTitle>
                      <CardDescription>현재 기준으로 참고 가치가 큰 shadcn 패턴</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div className="rounded-xl bg-muted p-4">
                        <div className="mb-2 flex items-center gap-2 font-medium">
                          <CalendarDays className="size-4" />
                          캘린더 뷰
                        </div>
                        <p className="text-muted-foreground">
                          `Card + Tabs + Table` 조합보다 달력 자체는 별도 라이브러리가 필요할 수 있음
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted p-4">
                        <div className="mb-2 flex items-center gap-2 font-medium">
                          <Bell className="size-4" />
                          검토 알림
                        </div>
                        <p className="text-muted-foreground">
                          토스트보다는 inbox 배지와 액션 패널 중심이 더 제품 성격에 맞음
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function MetricMini({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4">
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
      <div className="mt-2 text-sm text-muted-foreground">{meta}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm font-medium">{value}</div>
    </div>
  );
}
