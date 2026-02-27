"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import imageCompression from "browser-image-compression";
import { CalendarIcon, ImagePlus, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { runsQueryKey } from "@/hooks/useRuns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TEMP_HOST_ID = "51f77065-8159-487d-ad81-22fbcf3d631e";

const TIME_START_HOUR = 5;
const TIME_END_HOUR = 23;
const TIME_OPTIONS: { value: string; label: string }[] = Array.from(
  { length: (TIME_END_HOUR - TIME_START_HOUR) * 2 + 1 },
  (_, i) => {
    const totalMinutes = TIME_START_HOUR * 60 + i * 30;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    return { value, label };
  },
);
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_COMPRESSION_OPTIONS = {
  maxWidthOrHeight: 1280,
  initialQuality: 0.8,
  useWebWorker: true,
};

const createRunSchema = z.object({
  title: z.string().min(2, "제목은 최소 2자 이상이어야 합니다."),
  description: z.string().min(10, "설명은 최소 10자 이상이어야 합니다."),
  meeting_date: z.date({ required_error: "날짜를 선택해주세요." }),
  meeting_time: z.string().min(1, "시간을 입력해주세요."),
  meeting_place_name: z.string().min(1, "장소명을 입력해주세요."),
  meeting_address: z.string().min(1, "상세 주소를 입력해주세요."),
  max_capacity: z.coerce
    .number({ invalid_type_error: "숫자를 입력해주세요." })
    .min(1, "최소 1명 이상이어야 합니다."),
  target_distance_km: z.coerce
    .number({ invalid_type_error: "숫자를 입력해주세요." })
    .optional()
    .or(z.literal("")),
  target_pace_minute: z.string().optional(),
});

type CreateRunFormValues = z.infer<typeof createRunSchema>;

interface PreviewFile {
  file: File;
  previewUrl: string;
}

interface CreateRunPayload {
  formValues: CreateRunFormValues;
  previewFiles: PreviewFile[];
  thumbnailIndex: number | null;
}

async function uploadImages(files: PreviewFile[]): Promise<string[]> {
  if (files.length === 0) return [];
  const supabase = createClient();
  const uploadedUrls: string[] = [];

  for (const { file } of files) {
    const compressed = await imageCompression(file, IMAGE_COMPRESSION_OPTIONS);
    const ext = compressed.name.split(".").pop() ?? "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("runs_images")
      .upload(path, compressed, { contentType: compressed.type });

    if (error) throw new Error(`이미지 업로드 실패: ${error.message}`);

    const { data: urlData } = supabase.storage
      .from("runs_images")
      .getPublicUrl(path);

    uploadedUrls.push(urlData.publicUrl);
  }

  return uploadedUrls;
}

async function createRun({
  formValues,
  previewFiles,
  thumbnailIndex,
}: CreateRunPayload) {
  const supabase = createClient();
  const imageUrls = await uploadImages(previewFiles);

  const { meeting_date, meeting_time, target_distance_km, ...rest } =
    formValues;

  const [hours, minutes] = meeting_time.split(":").map(Number);
  const meetingAt = new Date(meeting_date);
  meetingAt.setHours(hours, minutes, 0, 0);

  const thumbnailUrl =
    thumbnailIndex !== null ? imageUrls[thumbnailIndex] : null;

  const { error } = await supabase.from("Runs").insert({
    ...rest,
    host_id: TEMP_HOST_ID,
    meeting_at: meetingAt.toISOString(),
    image_urls: imageUrls.length > 0 ? imageUrls : null,
    thumbnail_url: thumbnailUrl,
    target_distance_km:
      target_distance_km === "" || target_distance_km === undefined
        ? null
        : Number(target_distance_km),
    target_pace_minute: rest.target_pace_minute ?? null,
  });

  if (error) throw new Error(`모임 생성 실패: ${error.message}`);
}

export function CreateRunDialog() {
  const [open, setOpen] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState<number | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const form = useForm<CreateRunFormValues>({
    resolver: zodResolver(createRunSchema),
    defaultValues: {
      title: "",
      description: "",
      meeting_place_name: "",
      meeting_address: "",
      target_pace_minute: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: runsQueryKey });
      toast.success("모임이 성공적으로 생성되었습니다");
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function handleClose() {
    setOpen(false);
    form.reset();
    previewFiles.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    setPreviewFiles([]);
    setThumbnailIndex(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const valid: PreviewFile[] = [];
    const errors: string[] = [];

    for (const file of selected) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        errors.push(`${file.name}: JPEG, PNG, WEBP 형식만 허용됩니다.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`${file.name}: 파일 크기는 5MB 이하여야 합니다.`);
        continue;
      }
      valid.push({ file, previewUrl: URL.createObjectURL(file) });
    }

    if (errors.length > 0) toast.error(errors.join("\n"));

    setPreviewFiles((prev) => {
      if (thumbnailIndex === null && valid.length > 0) {
        setThumbnailIndex(prev.length);
      }
      return [...prev, ...valid];
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(index: number) {
    setPreviewFiles((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      const next = prev.filter((_, i) => i !== index);
      if (thumbnailIndex === index) {
        setThumbnailIndex(next.length > 0 ? 0 : null);
      } else if (thumbnailIndex !== null && thumbnailIndex > index) {
        setThumbnailIndex(thumbnailIndex - 1);
      }
      return next;
    });
  }

  function onSubmit(values: CreateRunFormValues) {
    const meetingDateTime = new Date(values.meeting_date);
    const [hours, minutes] = values.meeting_time.split(":").map(Number);
    meetingDateTime.setHours(hours, minutes, 0, 0);

    if (meetingDateTime <= new Date()) {
      form.setError("meeting_time", {
        message: "모임 날짜/시간은 현재 이후여야 합니다.",
      });
      return;
    }

    mutate({ formValues: values, previewFiles, thumbnailIndex });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
        else setOpen(true);
      }}
    >
      <Button
        className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        모임 만들기
      </Button>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            러닝 모임 만들기
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-2 flex flex-col gap-5"
          >
            {/* 제목 */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목 *</FormLabel>
                  <FormControl>
                    <Input placeholder="모임 제목을 입력해주세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 설명 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명 *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="모임에 대한 설명을 입력해주세요 (최소 10자)"
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 날짜 & 시간 */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="meeting_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>날짜 *</FormLabel>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "PPP", { locale: ko })
                              : "날짜 선택"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setCalendarOpen(false);
                          }}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meeting_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시간 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="시간 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {TIME_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 장소 */}
            <FormField
              control={form.control}
              name="meeting_place_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>장소명 *</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 한강 반포 안내센터" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meeting_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상세 주소 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예: 서울특별시 서초구 반포동 734"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 정원 / 거리 / 페이스 */}
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="max_capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>정원 *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="명"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? "" : e.target.valueAsNumber,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_distance_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>거리 (km)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.1}
                        placeholder="km"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? "" : e.target.valueAsNumber,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_pace_minute"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>페이스</FormLabel>
                    <FormControl>
                      <Input placeholder="5:30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 이미지 업로드 */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium leading-none">이미지</span>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_MIME_TYPES.join(",")}
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              {previewFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {previewFiles.map(({ previewUrl }, index) => (
                    <div
                      key={previewUrl}
                      className="relative aspect-square cursor-pointer overflow-hidden rounded-xl"
                      onClick={() => setThumbnailIndex(index)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt={`미리보기 ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {thumbnailIndex === index && (
                        <div className="absolute inset-0 flex items-end justify-center rounded-xl ring-2 ring-orange-500 ring-offset-1">
                          <span className="mb-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                            대표
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="gap-2 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4" />
                이미지 추가
              </Button>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WEBP · 파일당 최대 5MB · 첫 번째 이미지가 대표
                이미지로 설정됩니다
              </p>
            </div>

            {/* 하단 버튼 */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isPending}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  "모임 만들기"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
